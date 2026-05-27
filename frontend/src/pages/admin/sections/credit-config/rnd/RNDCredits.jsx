import Page from "../common/Page";
import Row from "../common/Row";
import { useState, useEffect } from "react";

function RNDCredits({ onBack, initialCategory }) {

const activeCategory = initialCategory;

const [credits, setCredits] = useState({

paperPublications: {

Journal: {
Scopus: { Q1: 30, Q2: 25, Q3: 20, Q4: 15 },
SCI: 28,
ESCI: 22,
UGC: 15,
Other: 10
},

Conference: {
Scopus: { Q1: 20, Q2: 18, Q3: 15, Q4: 12 },
SCI: 18,
ESCI: 15,
UGC: 10,
Other: 8
},

Other: {
Scopus: { Q1: 15, Q2: 12, Q3: 10, Q4: 8 },
SCI: 12,
ESCI: 10,
UGC: 8,
Other: 5
},

ImpactFactorBonus: { perPoint: 2 }

},

researchPolicy: {

"Research Policy": {
Member: 10,
Coordinator: 15,
Convener: 18,
Chairperson: 20
},

"R&D Committee": {
Member: 8,
Coordinator: 12,
Convener: 15,
Chairperson: 18
}

},

fdp: {
attended: {
Offline: { perDay: 2 },
Hybrid: { perDay: 1.5 }
},
organized: {
Offline: { perDay: 3 },
Hybrid: { perDay: 2 }
}
},

doctoralThesis: {
Guided: { perScholar: 2 },
Guiding: { perScholar: 1 }
},

researchProjects: {

roleCredits: {
"Principal Investigator": 30,
"Co-Principal Investigator": 20,
"Research Associate": 10,
"Team Member": 5
},

statusMultiplier: {
Applied: 0.3,
Ongoing: 0.6,
Completed: 1
}

},

professionalMemberships: {

"Professional Society": 10,
"Editorial Board": 15,
"Technical Committee": 12,
Other: 5

},

iprs: {

typeCredits: {
"Design Patent": 15,
Copyright: 10,
Trademark: 8
},

statusMultiplier: {
Filed: 0.5,
Published: 0.7,
Granted: 1
},

authorPositionMultiplier: {
1: 1,
2: 0.8,
3: 0.6,
Others: 0.4
}

},

incubation: {
Incubated: 10,
Ongoing: 15,
Graduated: 25,
Closed: 5
},

consultancy: {

typeCredits: {
Industry: 15,
Government: 18,
NGO: 10,
Institutional: 8,
Individual: 5
},

amountMultiplier: { perLakh: 2 }

},

mous: {

typeCredits: {
Industry: 15,
"Academic Institution": 10,
"Research Organization": 12,
"Government/PSU": 18,
NGO: 8
},

statusMultiplier: {
Active: 1,
Expired: 0.5
}

}

});

useEffect(() => {

fetch("http://localhost:5000/api/credit-config/rnd")
.then(res => res.json())
.then(data => {

if (data?.config) {
setCredits(prev => ({
...prev,
...data.config
}));
}

})
.catch(err => console.error(err));

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

await fetch("http://localhost:5000/api/credit-config/rnd", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ config: credits })
});

alert("R&D credit configuration saved");

} catch (error) {

console.error(error);
alert("Failed to save credits");

}

};

const renderRows = (obj, path = []) => {

return Object.entries(obj).map(([key, value]) => {

if (typeof value === "object" && !Array.isArray(value)) {

return (
<div key={key} style={sectionCard}>
<div style={sectionTitle}>{toTitle(key)}</div>
{renderRows(value, [...path, key])}
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
<div style={container}>

{renderRows(categoryCredits, [activeCategory])}

<button style={saveBtn} onClick={handleSave}>
Save Changes
</button>

</div>
</Page>
);

}

const container = { maxWidth: 900, margin: "0 auto" };

const sectionCard = {
border: "1px solid #e5e7eb",
borderRadius: 10,
padding: 16,
marginBottom: 16,
backgroundColor: "#ffffff",
boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
};

const sectionTitle = {
fontSize: 15,
fontWeight: 600,
marginBottom: 10,
color: "#111827"
};

const saveBtn = {
marginTop: 20,
padding: "10px 20px",
backgroundColor: "#2563eb",
color: "#ffffff",
border: "none",
borderRadius: 6,
cursor: "pointer"
};

const toTitle = (str) =>
str.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

export default RNDCredits;