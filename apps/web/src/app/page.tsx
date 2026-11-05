import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function Home() {
  return (
    <section className="max-w-3xl py-16">
      <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-indigo-600">
        RecruitFlow / Recruitment workspace
      </p>
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        A clear path from application to opportunity.
      </h1>
      <p className="my-7 text-xl leading-relaxed text-slate-600">
        Publish roles, review applications, and keep your hiring team in sync. A
        working foundation for thoughtful recruitment.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/jobs">Explore jobs</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Recruiter sign in</Link>
        </Button>
      </div>
      <p className="mt-12 text-sm text-slate-500">
        Starter release: live job workflows and a clearly labeled AI
        demonstration.
      </p>
      <div className="mt-12 grid gap-6 border-t pt-8 sm:grid-cols-3">
        {[
          [
            'Shared hiring workspace',
            'Manage published roles and applications within your organization.',
          ],
          [
            'Clear candidate progress',
            'Follow each application through controlled recruitment stages.',
          ],
          [
            'Human decisions first',
            'Explore synthetic AI examples while recruiters retain every hiring decision.',
          ],
        ].map(([title, description]) => (
          <article key={title}>
            <h2 className="mb-2 font-semibold">{title}</h2>
            <p className="text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
