export default function PrivacyPolicy() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 bg-slate-50">
      <div className="rounded-[2rem] border border-blue-200 bg-white p-8 shadow-lg shadow-slate-900/5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-yellow-100 px-4 py-1 text-xs uppercase tracking-[0.25em] text-blue-900">
              Privacy Policy
            </span>
            <div>
              <h1 className="font-poppins text-4xl font-bold text-blue-950">How Learn Malawi protects your data.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                We keep student, parent, and teacher data safe while delivering a personalised learning experience.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Last updated</p>
              <p className="mt-3 text-lg font-semibold text-foreground">May 14, 2026</p>
            </div>
            <div className="rounded-3xl border border-blue-200 bg-blue-50/40 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Core promise</p>
              <p className="mt-3 text-lg font-semibold text-foreground">Your learning data stays private and secure.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-7">
              Welcome to Learn Malawi. We are committed to protecting your personal information and your right to privacy. This policy explains how we collect, use, and safeguard your data.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <ul className="space-y-3 text-muted-foreground pl-5 list-disc leading-7">
              <li><span className="font-semibold text-foreground">Account Information:</span> Name and email address when you register.</li>
              <li><span className="font-semibold text-foreground">Usage Data:</span> Pages visited, resources accessed, quiz scores, and study streaks.</li>
              <li><span className="font-semibold text-foreground">Device Information:</span> Browser type, operating system, and IP address for security and analytics.</li>
              <li><span className="font-semibold text-foreground">Parent/Child Links:</span> Emails used to connect parent and student accounts.</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="space-y-3 text-muted-foreground pl-5 list-disc leading-7">
              <li>To provide and personalise your learning experience.</li>
              <li>To track progress, streaks, and achievements.</li>
              <li>To improve platform content and features.</li>
              <li>To communicate important updates or changes.</li>
              <li>To allow parents to monitor their child's progress with consent.</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-7">
              We do <strong className="text-foreground">not</strong> sell, trade, or rent your personal data. We may share anonymised, aggregated data for research or educational improvement, and we only share data with trusted service providers as needed to operate the platform.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">5. Children's Privacy</h2>
            <p className="text-muted-foreground leading-7">
              Learn Malawi is designed for learners of all ages, including users under 13. We do not knowingly collect sensitive personal data from minors beyond what is necessary to provide educational services. Parents may request deletion of their child's data at any time.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">6. Data Security</h2>
            <p className="text-muted-foreground leading-7">
              We implement industry-standard security measures to protect your information. All data is transmitted over encrypted connections (HTTPS). However, no method of transmission is 100% secure.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <ul className="space-y-3 text-muted-foreground pl-5 list-disc leading-7">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction or deletion of your data.</li>
              <li>Withdraw consent for data processing at any time.</li>
              <li>Lodge a complaint with a relevant data protection authority.</li>
            </ul>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">8. Cookies</h2>
            <p className="text-muted-foreground leading-7">
              We use essential cookies to keep you logged in and remember your preferences. We do not use advertising or tracking cookies.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-blue-200 bg-white p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-7">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on the platform. Continued use of Learn Malawi after changes are posted constitutes acceptance.
            </p>
          </article>

          <article className="rounded-[1.75rem] border border-border bg-background p-7 shadow-sm">
            <h2 className="font-poppins text-2xl font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p className="text-muted-foreground leading-7">
              Questions? Reach out at <strong className="text-foreground">privacy@learnmalawi.mw</strong>.
            </p>
          </article>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[1.75rem] border border-blue-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">Policy highlights</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><span className="font-semibold text-foreground">No data sales.</span> Your personal information stays private.</li>
              <li><span className="font-semibold text-foreground">Secure connections.</span> We use HTTPS to protect your data in transit.</li>
              <li><span className="font-semibold text-foreground">Clear rights.</span> You can access, correct, or delete your data.</li>
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-blue-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-3">Why it matters</h3>
            <p className="text-muted-foreground leading-7">
              Safe, private learning builds trust and helps students focus on achieving their goals.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
