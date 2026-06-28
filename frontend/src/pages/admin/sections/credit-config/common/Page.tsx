import { ArrowLeft } from "lucide-react";

function Page({ title, onBack, children }) {
  return (
    <div className="w-full">
      {/* BACK BUTTON */}
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Configuration
      </button>

      {/* PAGE TITLE */}
      <h2 className="text-3xl font-display font-bold text-on-surface mb-8">{title}</h2>

      {/* PAGE CONTENT */}
      {children}
    </div>
  );
}

export default Page;
