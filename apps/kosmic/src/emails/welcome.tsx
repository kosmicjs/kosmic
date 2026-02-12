import EmailLayout from './layout/layout.tsx';

export type WelcomeEmailProps = {
  readonly verificationLink: string;
};

export default function WelcomeEmail({verificationLink}: WelcomeEmailProps) {
  return (
    <EmailLayout title="Welcome to Kosmic">
      <div className="mb-4">
        <h2 className="text-info align-center">Welcome to Kosmic</h2>
        <p className="lead">Thank you for signing up for Kosmic.</p>
        <p>We&apos;re excited to have you on board!</p>
      </div>

      <div className="mb-4">
        <p>
          To get started, please verify your email address by clicking the
          button below:
        </p>
        <div className="text-center my-3">
          <a href={verificationLink} className="btn px-4 py-2 bg-primary">
            Verify Email
          </a>
        </div>
        <p className="text-muted small">
          Or copy and paste this link into your browser:
        </p>
        <p className="text-break small">{verificationLink}</p>
      </div>

      <hr className="my-4" />

      <div>
        <p>If you have any questions, feel free to reply to this email.</p>
        <p>
          Best regards,
          <br />
          <strong>The Kosmic Team</strong>
        </p>
      </div>
    </EmailLayout>
  );
}
