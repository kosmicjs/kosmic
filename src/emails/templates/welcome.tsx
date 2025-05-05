import EmailLayout from '../layout.js';

export type WelcomeEmailProps = {
  readonly userName: string;
  readonly verificationLink?: string;
};

export default function WelcomeEmail({
  userName,
  verificationLink,
}: WelcomeEmailProps) {
  return (
    <EmailLayout
      title="Welcome to Kosmic"
      previewText="Welcome to Kosmic! Verify your account to get started."
      headerText="Welcome to Kosmic"
    >
      <div className="mb-4">
        <h2 className="text-primary">Hello, {userName}!</h2>
        <p className="lead">
          Thank you for signing up for Kosmic. We&apos;re excited to have you on
          board!
        </p>
      </div>

      {verificationLink ? (
        <div className="mb-4">
          <p>
            To get started, please verify your email address by clicking the
            button below:
          </p>
          <div className="text-center my-3">
            <a href={verificationLink} className="btn btn-primary px-4 py-2">
              Verify Email
            </a>
          </div>
          <p className="text-muted small">
            Or copy and paste this link into your browser:
          </p>
          <p className="text-break small">{verificationLink}</p>
        </div>
      ) : null}

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
