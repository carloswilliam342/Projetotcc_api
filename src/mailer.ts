import nodemailer from 'nodemailer';
import dns from 'dns';

// Tenta forçar resolução DNS via IPv4 globalmente no Node.js
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Usa SSL na porta 465
  family: 4, // Força explicitamente o uso de IPv4 na conexão do Nodemailer (Evita erro ENETUNREACH no Render)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
} as any);

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🧠 Sinapse</h1>
        <p style="color: #c7d2fe; margin: 8px 0 0; font-size: 14px;">Plataforma de Educação Inclusiva</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 0 0 12px;">Redefinição de Senha</h2>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. 
          Este link é válido por <strong>1 hora</strong>.
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
            Redefinir minha senha
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 24px 0 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanecerá inalterada.
        </p>
        <p style="color: #cbd5e1; font-size: 11px; margin: 16px 0 0;">
          Caso o botão não funcione, copie e cole este link no navegador:<br/>
          <a href="${resetLink}" style="color: #6366f1; word-break: break-all;">${resetLink}</a>
        </p>
      </div>
      <div style="background: #f8fafc; padding: 16px 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">Sinapse © ${new Date().getFullYear()} — Este é um e-mail automático.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Sinapse" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Redefinição de Senha — Sinapse',
    html,
  });
}
