import TemplateCard from "@/components/templates/TemplateCard";
import { getTemplates } from "@/lib/api";

const TemplatesPage = async () => {
  const data = await getTemplates();
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Choose a Template</h1>
          <p className="mt-2 text-gray-600">
            Select a poster template to get started.
          </p>
        </header>
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.templates.map((template: any) => (
            <TemplateCard key={template._id} template={template} />
          ))}
        </section>
      </div>
    </main>
  );
};
export default TemplatesPage;
