from django.contrib.auth.tokens import PasswordResetTokenGenerator

class SubmissionTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, pending_submission, timestamp):
        # Include email + verified status + timestamp
        return f"{pending_submission.id}{pending_submission.email}{pending_submission.status}{timestamp}"

submission_token = SubmissionTokenGenerator()