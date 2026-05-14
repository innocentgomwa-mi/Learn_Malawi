export default function TermsAndConditions() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="rounded-[2rem] border border-border bg-card p-8 shadow-lg shadow-slate-900/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-primary-foreground">
              Terms & Conditions
            </span>
            <div>
              <h1 className="font-poppins text-4xl font-bold text-foreground">A modern, student-friendly policy for Learn Malawi.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                These Terms explain how Learn Malawi works, what is expected from users, and how we protect everyone in the community.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-border bg-background p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Last updated</p>
              <p className="mt-3 text-lg font-semibold text-foreground">May 14, 2026</p>
            </div>
            <div className="rounded-3xl border border-border bg-background p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Applies to</p>
              <p className="mt-3 text-lg font-semibold text-foreground">Students, parents, teachers, and visitors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-7">
              By accessing or using Learn Malawi, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the platform.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">2. Use of the Platform</h2>
            <ul className="space-y-3 text-muted-foreground pl-5 list-disc leading-7">
              <li>Learn Malawi is a free educational platform for Malawian students at PSLC, JCE, and MSCE levels.</li>
              <li>Provide accurate information when creating an account.</li>
              <li>Keep your account credentials secure and private.</li>
              <li>Do not use the platform for unlawful or harmful activities.</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">3. Intellectual Property</h2>
            <p className="text-muted-foreground leading-7">
              All content on Learn Malawi — including study notes, past papers, tutorials, quizzes, and graphics — is protected by copyright. Content may be used only for personal, non-commercial educational purposes.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">4. User Content</h2>
            <p className="text-muted-foreground leading-7">
              If you submit content to the platform, you grant Learn Malawi a non-exclusive, royalty-free licence to use, display, and distribute that content within the service. Do not submit offensive, misleading, or unlawful material.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">5. AI-Generated Content</h2>
            <p className="text-muted-foreground leading-7">
              The platform uses AI tools to generate quizzes, summaries, and tutoring responses. While we strive for accuracy, AI-generated content may contain errors. Always verify important information with your teachers or official curriculum materials.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">6. Parent Accounts</h2>
            <p className="text-muted-foreground leading-7">
              Parents who link to a student account must have consent or parental authority. Parents agree to manage linked information responsibly.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">7. Prohibited Conduct</h2>
            <ul className="space-y-3 text-muted-foreground pl-5 list-disc leading-7">
              <li>Attempting to hack, disrupt, or overload the platform.</li>
              <li>Scraping or copying content for commercial redistribution.</li>
              <li>Impersonating another user or creating fake accounts.</li>
              <li>Sharing account credentials with others.</li>
              <li>Posting harmful, abusive, or illegal content in study groups.</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground leading-7">
              Learn Malawi is provided “as is” without warranties of any kind. We cannot guarantee the platform will be error-free, uninterrupted, or that exam performance will improve as a result of using the platform.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-7">
              To the maximum extent permitted by law, Learn Malawi is not liable for indirect, incidental, or consequential damages arising from your use of the platform, including loss of data or exam results.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">10. Termination</h2>
            <p className="text-muted-foreground leading-7">
              We reserve the right to suspend or terminate accounts that violate these Terms. You may also request account deletion at any time by contacting us.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">11. Governing Law</h2>
            <p className="text-muted-foreground leading-7">
              These Terms are governed by the laws of the Republic of Malawi. Any disputes will be resolved in Malawian courts.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">12. Changes to Terms</h2>
            <p className="text-muted-foreground leading-7">
              We may update these Terms at any time. Continued use of Learn Malawi after changes are posted means you accept the revised Terms.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">13. Contact Us</h2>
            <p className="text-muted-foreground leading-7">
              For questions about these Terms, contact us at <strong className="text-foreground">legal@learnmalawi.mw</strong>.
            </p>
          </article>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[1.75rem] border border-border bg-background p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">Quick Overview</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><span className="font-semibold text-foreground">Respect the community.</span> Use the platform with kindness and honesty.</li>
              <li><span className="font-semibold text-foreground">Protect your account.</span> Keep credentials private and secure.</li>
              <li><span className="font-semibold text-foreground">Use content responsibly.</span> Learn for personal education, not commercial redistribution.</li>
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-border bg-background p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">Need help?</h3>
            <p className="text-muted-foreground leading-7">
              Contact our legal team at <strong className="text-foreground">legal@learnmalawi.mw</strong> for clarification about these Terms.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
