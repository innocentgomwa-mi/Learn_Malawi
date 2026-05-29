import { Shield, Clock, BookOpen, Users, Zap, AlertTriangle, Scale, Mail } from "lucide-react";

const SECTIONS = [
  {
    number: "01",
    title: "Acceptance of Terms",
    content: "By accessing or using Learn Malawi, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of the platform.",
  },
  {
    number: "02",
    title: "Use of the Platform",
    bullets: [
      "Learn Malawi is a free educational platform for Malawian students at PSLC, JCE, and MSCE levels.",
      "Provide accurate information when creating an account.",
      "Keep your account credentials secure and private.",
      "Do not use the platform for unlawful or harmful activities.",
    ],
  },
  {
    number: "03",
    title: "Intellectual Property",
    content:
      "All content on Learn Malawi — including study notes, past papers, tutorials, quizzes, and graphics — is protected by copyright. Content may be used only for personal, non-commercial educational purposes.",
  },
  {
    number: "04",
    title: "User Content",
    content:
      "If you submit content to the platform, you grant Learn Malawi a non-exclusive, royalty-free licence to use, display, and distribute that content within the service. Do not submit offensive, misleading, or unlawful material.",
  },
  {
    number: "05",
    title: "AI-Generated Content",
    content:
      "The platform uses AI tools to generate quizzes, summaries, and tutoring responses. While we strive for accuracy, AI-generated content may contain errors. Always verify important information with your teachers or official curriculum materials.",
  },
  {
    number: "06",
    title: "Parent Accounts",
    content:
      "Parents who link to a student account must have consent or parental authority. Parents agree to manage linked information responsibly.",
  },
  {
    number: "07",
    title: "Prohibited Conduct",
    bullets: [
      "Attempting to hack, disrupt, or overload the platform.",
      "Scraping or copying content for commercial redistribution.",
      "Impersonating another user or creating fake accounts.",
      "Sharing account credentials with others.",
      "Posting harmful, abusive, or illegal content in study groups.",
    ],
  },
  {
    number: "08",
    title: "Disclaimer of Warranties",
    content:
      'Learn Malawi is provided "as is" without warranties of any kind. We cannot guarantee the platform will be error-free, uninterrupted, or that exam performance will improve as a result of using the platform.',
  },
  {
    number: "09",
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by law, Learn Malawi is not liable for indirect, incidental, or consequential damages arising from your use of the platform, including loss of data or exam results.",
  },
  {
    number: "10",
    title: "Termination",
    content:
      "We reserve the right to suspend or terminate accounts that violate these Terms. You may also request account deletion at any time by contacting us.",
  },
  {
    number: "11",
    title: "Governing Law",
    content:
      "These Terms are governed by the laws of the Republic of Malawi. Any disputes will be resolved in Malawian courts.",
  },
  {
    number: "12",
    title: "Changes to Terms",
    content:
      "We may update these Terms at any time. Continued use of Learn Malawi after changes are posted means you accept the revised Terms.",
  },
];

const QUICK_FACTS = [
  { icon: Users, label: "Applies to", value: "Students, Parents & Teachers" },
  { icon: Clock, label: "Last updated", value: "May 14, 2026" },
  { icon: Scale, label: "Jurisdiction", value: "Republic of Malawi" },
];

const HIGHLIGHTS = [
  { icon: Shield, label: "Respect the community", desc: "Use the platform with kindness and honesty." },
  { icon: BookOpen, label: "Use content responsibly", desc: "Personal education only — not commercial redistribution." },
  { icon: Zap, label: "Protect your account", desc: "Keep credentials private and never share them." },
  { icon: AlertTriangle, label: "AI has limits", desc: "Verify important info with teachers or official materials." },
];

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 p-8 lg:p-12 text-white">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur-sm mb-6">
              <Shield className="h-3.5 w-3.5" /> Terms &amp; Conditions
            </span>
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight max-w-2xl">
              A modern, student&#8209;friendly policy for Learn Malawi.
            </h1>
            <p className="mt-4 text-white/70 max-w-xl leading-relaxed">
              These Terms explain how Learn Malawi works, what is expected from users, and how we protect everyone in the community.
            </p>
          </div>

          {/* Quick facts */}
          <div className="relative mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_FACTS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
                <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider mb-2">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </div>
                <p className="font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="rounded-2xl border border-blue-200 bg-white p-5 flex flex-col gap-3">
              <div className="h-10 w-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-blue-900" />
              </div>
              <p className="font-semibold text-sm text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="space-y-4">
          {SECTIONS.map((section) => (
            <div key={section.number} className="group rounded-2xl border border-blue-200 bg-white p-6 lg:p-7 transition-all hover:border-yellow-300 hover:shadow-md">
              <div className="flex items-start gap-5">
                <span className="flex-shrink-0 text-3xl font-bold text-blue-200 group-hover:text-blue-300 transition-colors leading-none mt-0.5 select-none">
                  {section.number}
                </span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground mb-3">{section.title}</h2>
                  {section.content && (
                    <p className="text-muted-foreground leading-7 text-sm">{section.content}</p>
                  )}
                  {section.bullets && (
                    <ul className="space-y-2">
                      {section.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact footer */}
        <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-yellow-50 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground text-lg mb-1">Have questions about these Terms?</h3>
            <p className="text-muted-foreground text-sm">Our legal team is here to help clarify anything.</p>
          </div>
          <a
            href="mailto:legal@learnmalawi.mw"
            className="inline-flex items-center gap-2.5 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-semibold text-blue-950 hover:bg-yellow-300 transition-colors flex-shrink-0"
          >
            <Mail className="h-4 w-4" />
            legal@learnmalawi.mw
          </a>
        </div>

      </div>
    </div>
  );
}