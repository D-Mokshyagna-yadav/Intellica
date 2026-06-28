import Page from "../common/Page";
import Row from "../common/Row";
import { useState, useEffect } from "react";
import { apiFetch } from "../../../../../api";
import { showToast } from "../../../../../utils/toast";
import { Save } from "lucide-react";

function ProfessionalCredits({ onBack, initialCategory }) {
  const activeCategory = initialCategory;

  const [credits, setCredits] = useState({
    conferences: {
      conferencePresentation: {
        International: { Offline: 20, Hybrid: 18 },
        National: { Offline: 15, Hybrid: 12 },
      },
      participation: {
        International: { Offline: 10, Hybrid: 8 },
        National: { Offline: 7, Hybrid: 5 },
      },
      organized: {
        International: { Offline: 25, Hybrid: 22 },
        National: { Offline: 20, Hybrid: 17 },
      },
    },
    workshops: {
      attended: {
        International: { Offline: { base: 5, perDay: 2 }, Hybrid: { base: 4, perDay: 1.5 } },
        National: { Offline: { base: 4, perDay: 1.5 }, Hybrid: { base: 3, perDay: 1 } },
        State: { Offline: { base: 3, perDay: 1 }, Hybrid: { base: 2, perDay: 0.8 } },
        Institutional: { Offline: { base: 2, perDay: 0.5 }, Hybrid: { base: 1.5, perDay: 0.4 } }
      },
      organized: {
        International: { Offline: { base: 15, perDay: 3 }, Hybrid: { base: 12, perDay: 2.5 } },
        National: { Offline: { base: 12, perDay: 2.5 }, Hybrid: { base: 10, perDay: 2 } },
        State: { Offline: { base: 10, perDay: 2 }, Hybrid: { base: 8, perDay: 1.5 } },
        Institutional: { Offline: { base: 8, perDay: 1.5 }, Hybrid: { base: 6, perDay: 1 } }
      }
    },
    guestLectures: {
      delivered: { Offline: { base: 10, perHour: 2 }, Hybrid: { base: 8, perHour: 1.5 } },
      attended: { Offline: { base: 2, perHour: 0.5 }, Hybrid: { base: 1.5, perHour: 0.4 } },
      organized: { Offline: { base: 8, perHour: 1.5 }, Hybrid: { base: 6, perHour: 1 } }
    },
    books: {
      "Authored Book": 25,
      "Edited Book": 15,
      "Book Chapter": 10,
    },
    nptel: {
      "4 Weeks": { Pass: 3, Elite: 5, Silver: 6, Gold: 7, "Topper 5%": 8, "Topper 2%": 9, "Topper 1%": 10, "Topper of Batch": 12 },
      "8 Weeks": { Pass: 5, Elite: 8, Silver: 9, Gold: 10, "Topper 5%": 12, "Topper 2%": 14, "Topper 1%": 16, "Topper of Batch": 18 },
      "12 Weeks": { Pass: 8, Elite: 12, Silver: 14, Gold: 16, "Topper 5%": 18, "Topper 2%": 20, "Topper 1%": 22, "Topper of Batch": 25 },
      "16 Weeks": { Pass: 10, Elite: 16, Silver: 18, Gold: 20, "Topper 5%": 22, "Topper 2%": 24, "Topper 1%": 26, "Topper of Batch": 30 }
    },
    seminars: {
      attended: { Offline: { base: 2, perDay: 1 }, Hybrid: { base: 1.5, perDay: 0.8 } },
      delivered: { Offline: { base: 5, perDay: 2 }, Hybrid: { base: 4, perDay: 1.5 } },
      organized: { Offline: { base: 6, perDay: 2 }, Hybrid: { base: 5, perDay: 1.5 } }
    },
    webinars: {
      attended: { Offline: { base: 2, perDay: 1 }, Hybrid: { base: 1.5, perDay: 0.8 } },
      delivered: { Offline: { base: 5, perDay: 2 }, Hybrid: { base: 4, perDay: 1.5 } },
      organized: { Offline: { base: 6, perDay: 2 }, Hybrid: { base: 5, perDay: 1.5 } }
    },
    honorsAwards: { Award: 20 },
    certifications: {
      Global: { perDay: 2 },
      Others: { perDay: 1 }
    },
    others: {
      base: 5,
      perDay: 1
    }
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/credit-config/professional")
      .then(data => {
        if (data?.config && Object.keys(data.config).length > 0) {
          setCredits(prev => ({
            ...prev,
            ...data.config
          }));
        }
      })
      .catch((error) => showToast({ type: "error", message: error.message || "Failed to load professional credits" }));
  }, []);

  const updateCredit = (path, value) => {
    setCredits(prev => {
      const updated = structuredClone(prev);
      let ref = updated;
      for (let i = 0; i < path.length - 1; i++) {
        ref = ref[path[i]];
      }
      ref[path[path.length - 1]] = Number(value);
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiFetch("/credit-config/professional", {
        method: "POST",
        body: JSON.stringify({ config: credits })
      });
      showToast({ type: "success", message: "Professional credit configuration saved" });
    } catch (error) {
      showToast({ type: "error", message: error.message || "Failed to save credits" });
    } finally {
      setSaving(false);
    }
  };

  const renderRows = (obj, path = []) => {
    return Object.entries(obj).map(([key, value]) => {
      if (typeof value === "object" && !Array.isArray(value)) {
        return (
          <div key={key} className="bg-glass-card border border-subtle rounded-2xl p-6 mb-6">
            <div className="text-lg font-bold text-on-surface mb-4 border-b border-subtle pb-2">
              {toTitle(key)}
            </div>
            <div className="pl-2">
              {renderRows(value, [...path, key])}
            </div>
          </div>
        );
      }
      return (
        <Row
          key={key}
          label={toTitle(key)}
          value={value}
          onChange={(val) => updateCredit([...path, key], val)}
        />
      );
    });
  };

  const categoryCredits = credits[activeCategory] || {};

  return (
    <Page title={toTitle(activeCategory)} onBack={onBack}>
      <div className="max-w-4xl">
        <div className="space-y-6">
          {renderRows(categoryCredits, [activeCategory])}
        </div>
        <div className="mt-8">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-primary px-8 py-3 flex items-center gap-2"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </Page>
  );
}

const toTitle = (str) => str.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

export default ProfessionalCredits;
