import { Router } from 'express';
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import prisma from '../prisma';

const router = Router();

// Garantindo que a chave esteja disponível no process.env
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

router.post('/suggest-activity', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({ error: 'Chave de API do Gemini não configurada no servidor (.env).' });
    }

    const { studentId, subject, theme, difficultyLevel } = req.body;

    if (!studentId || !subject || !theme) {
      return res.status(400).json({ error: 'Estudante (studentId), disciplina (subject) e tema (theme) são obrigatórios.' });
    }

    // 1. Buscar o aluno com todos os dados relevantes de histórico
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        profile: true,
        observations: {
          orderBy: { date: 'desc' },
          take: 5 // Pegar as 5 últimas observações para contexto
        },
        performanceRecords: {
          orderBy: { date: 'desc' },
          take: 5 // Pegar o desempenho das 5 últimas atividades
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Aluno não encontrado.' });
    }

    const profile = student.profile;
    
    // 2. Montar o texto de contexto do aluno
    let contextStr = `Aluno: ${student.name}\n`;
    
    if (student.needsTea || student.needsTdah || student.otherNeeds) {
       contextStr += `Necessidades: `;
       const needs = [];
       if (student.needsTea) needs.push('TEA (Transtorno do Espectro Autista)');
       if (student.needsTdah) needs.push('TDAH (Transtorno de Déficit de Atenção e Hiperatividade)');
       if (student.otherNeeds) needs.push(student.otherNeeds);
       contextStr += needs.join(', ') + '\n';
    }

    if (profile) {
      contextStr += `Nível de Desempenho Atual: ${profile.performanceLevel}\n`;
      if (profile.neurodivergence && profile.neurodivergence.length > 0) {
        contextStr += `Diagnósticos/Neurodivergência: ${profile.neurodivergence.join(', ')}\n`;
      }
      if (profile.difficulties && profile.difficulties.length > 0) {
        contextStr += `Dificuldades principais: ${profile.difficulties.join(', ')}\n`;
      }
      if (profile.notes) {
        contextStr += `Notas gerais de perfil: ${profile.notes}\n`;
      }
    }

    if (student.observations && student.observations.length > 0) {
      contextStr += `\nHistórico Recente de Observações Comportamentais nas Aulas:\n`;
      student.observations.forEach(obs => {
         contextStr += `- Comportamento: ${obs.behavior}, Participação: ${obs.participation}, Conclusão da atividade: ${obs.completion}. Notas do professor: ${obs.notes}\n`;
      });
    }

    if (student.performanceRecords && student.performanceRecords.length > 0) {
      contextStr += `\nDesempenho Recente em Atividades Anteriores:\n`;
      student.performanceRecords.forEach(perf => {
         contextStr += `- Atividade: ${perf.activityTitle}, Dificuldade (1-5): ${perf.difficultyLevel}, Status: ${perf.status}. Notas: ${perf.notes}\n`;
      });
    }

    // 3. Configurar o Schema de retorno do Gemini (JSON Estrito)
    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: "Um título criativo e adaptado para a atividade."
        },
        description: {
          type: SchemaType.STRING,
          description: "A descrição completa do que se trata a atividade e seus objetivos pedagógicos adaptados para esse aluno específico."
        },
        steps: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Passo a passo sequencial da atividade, quebrado em partes gerenciáveis e acessíveis."
        },
        visualResources: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Lista de recursos visuais sugeridos ou materiais concretos de apoio para ajudar esse aluno."
        },
        adaptedFor: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Lista de necessidades para as quais a atividade foi adaptada, baseada no aluno. Opções válidas: 'TEA', 'TDAH', 'Dislexia', 'Discalculia', 'Deficiência Intelectual'. Retorne apenas as aplicáveis correspondentes ao perfil do aluno."
        }
      },
      required: ["title", "description", "steps", "visualResources", "adaptedFor"]
    };

    // Usaremos o modelo "gemini-2.5-flash", que é extremamente rápido e gratuito.
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as Schema
      }
    });

    // 4. Montar o Prompt Especializado
    const prompt = `Você é um assistente pedagógico especializado em educação inclusiva.
Sua tarefa é criar uma sugestão detalhada de atividade escolar.

O professor está planejando uma atividade da disciplina "${subject}" focada no conteúdo/tema "${theme}" para o aluno descrito abaixo.
${difficultyLevel ? `A dificuldade desejada pelo professor (1 a 5) é: ${difficultyLevel}.` : ''}

=== PERFIL E HISTÓRICO DO ALUNO ===
${contextStr}
===================================

INSTRUÇÕES PEDAGÓGICAS PARA O MODELO:
- Adapte a linguagem, o tempo estimado e a complexidade para se adequarem ao nível de desempenho, necessidades (TEA, TDAH, etc.) e dificuldades do aluno.
- Se o aluno não tiver um lado forte de participação contínua ou tiver perfil de desatenção, sugira passos muito curtos ("micro-passos") com recompensas/pausas ("tokens").
- Caso haja histórico de não conclusão ou resistência a certos estímulos detalhado no histórico, evite-os ativamente.
- Proponha recursos visuais eficientes ("timers" visuais, pictogramas, blocos lógicos, pranchas de comunicação) se adequarem ao perfil analisado.
- Você DEVE retornar EXCLUSIVAMENTE UM OBJETO JSON, contendo "title", "description", "steps" (array), "visualResources" (array) e "adaptedFor" (array).
`;

    // 5. Chamar a API e Retornar
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return res.json(JSON.parse(responseText));

  } catch (error) {
    console.error('Erro na integração com o Gemini API:', error);
    return res.status(500).json({ error: 'Erro ao gerar sugestão de atividade utilizando a IA.' });
  }
});

export default router;
