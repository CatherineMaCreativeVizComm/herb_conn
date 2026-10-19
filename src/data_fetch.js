const seasonMap = {
  "立春": "Beginning of Spring", "雨水": "Rain Water", "惊蛰": "Waking of Insects",
  "春分": "Spring Equinox", "清明": "Pure Brightness", "谷雨": "Grain Rain",
  "立夏": "Beginning of Summer", "小满": "Grain Full", "芒种": "Grain in Ear",
  "夏至": "Summer Solstice", "小暑": "Slight Heat", "大暑": "Great Heat",
  "立秋": "Beginning of Autumn", "处暑": "Limit of Heat", "白露": "White Dew",
  "秋分": "Autumnal Equinox", "寒露": "Cold Dew", "霜降": "Descent of Frost",
  "立冬": "Beginning of Winter", "小雪": "Slight Snow", "大雪": "Great Snow",
  "冬至": "Winter Solstice", "小寒": "Slight Cold", "大寒": "Great Cold"
};

const groupMap = {
  "清热解表": "Heat-Clearing and Exterior-Releasing",
  "肺系化痰止咳": "Phlegm-Resolving and Cough-Relieving",
  "脾胃消食导滞": "Digestion-Promoting and Stagnation-Removing",
  "肝胆气血调经": "Qi-Blood and Menstruation-Regulating",
  "滋阴补益": "Yin-Nourishing and Deficiency-Tonifying",
  "安神平肝定惊": "Mind-Calming, Liver-Pacifying, and Convulsion-Relieving"
};

export async function fetchAndProcessData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const csvText = await response.text();
    const { dataA, dataB, dataC } = parseAndSplitCSV(csvText);
    const translatedDataA = translateData(dataA);
    const nestedJSON = mergeDatasets(translatedDataA, dataB, dataC);
    
    return nestedJSON;
  } catch (error) {
    console.error("Error loading or processing the CSV file:", error);
    return null; 
  }
}

function parseAndSplitCSV(text) {
  const rows = text.trim().split("\n");
  const dataA = [], dataB = [], dataC = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    const columns = [];
    let currentColumn = '';
    let inQuotes = false;

    for (let j = 0; j < row.length; j++) {
      const char = row[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        columns.push(currentColumn.trim());
        currentColumn = ''; 
      } else {
        currentColumn += char;
      }
    }
    columns.push(currentColumn.trim());

    if (columns[0]) {
      dataA.push({
        id_tea: columns[0],
        name: columns[1],
        tea_img: columns[2],
        season: columns[3],
        groups: columns[4]
      });
    }

    if (columns[7]) {
      dataB.push({
        id_tea_fml: columns[7],
        name_fml: columns[8],
        elm: columns[9],
        id_herb_fml: columns[10],
        value: columns[11]
      });
    }

    if (columns[14]) {
      dataC.push({
        id_herb: columns[14],
        englat: columns[15],
        herb_img: columns[16],
        nature: columns[17],
        meridian_affinity: columns[18],
        flavor: columns[19],
        title_sim: columns[20]
      });
    }
  }

  return { dataA, dataB, dataC };
}

function translateData(data) {
  return data.map(row => {
    if (row.season) {
      row.season = row.season
        .split(',')
        .map(item => seasonMap[item.trim()] || item.trim())
        .join(', ');
    }

    if (row.groups) {
      row.groups = row.groups
        .split(',')
        .map(item => groupMap[item.trim()] || item.trim())
        .join(', ');
    }
    return row;
  });
}

function mergeDatasets(teas, formulas, herbs) {
  const nestedData = {};

  teas.forEach(tea => {
    if (!nestedData[tea.id_tea]) {
      nestedData[tea.id_tea] = {
        name: tea.name,
        tea_img: tea.tea_img,
        season: tea.season,
        groups: tea.groups,
        herbs: []
      };
    }
  });

  formulas.forEach(formula => {
    const teaId = formula.id_tea_fml;
    
    if (nestedData[teaId]) {
      const matchingHerb = herbs.find(h => h.id_herb === formula.id_herb_fml);
      
      nestedData[teaId].herbs.push({
        id_herb: formula.id_herb_fml,
        herb_name: formula.elm,
        herb_value: formula.value,
        herb_img: matchingHerb ? matchingHerb.herb_img : '',
        nature: matchingHerb ? matchingHerb.nature : '',
        meridian_affinity: matchingHerb ? matchingHerb.meridian_affinity : '',
        flavor: matchingHerb ? matchingHerb.flavor : '',
        englat: matchingHerb ? matchingHerb.englat : ''
      });
    }
  });

  return nestedData;
}