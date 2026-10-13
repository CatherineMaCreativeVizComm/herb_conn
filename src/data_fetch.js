
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
    
    let parsedData = parseCSV(csvText);
    parsedData = translateData(parsedData);
    const nestedJSON = nestDataByTea(parsedData);
    
    return nestedJSON;
  } catch (error) {
    console.error("Error loading or processing the CSV file:", error);
    return null;
  }
}

function parseCSV(text) {
  const rows = text.trim().split("\n");
  if (rows.length === 0) return [];

  const parsedRows = rows.map(row => {
    const columns = [];
    let currentColumn = '';
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
      const char = row[i];
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
    return columns;
  });

  const headers = parsedRows[0];
  const dataObjects = [];

  for (let i = 1; i < parsedRows.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = parsedRows[i][j];
    }
    dataObjects.push(obj);
  }

  return dataObjects;
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

function nestDataByTea(data) {
  const nestedData = {};

  data.forEach(row => {
    const teaid = row.id_tea;

    if (!teaid) return;
    if (!nestedData[teaid]) {
      nestedData[teaid] = {
        name: row.name,
        tea_img: row.tea_img,
        season: row.season,
        groups: row.groups,
        herbs: []
      };
    }

    const herbInfo = {
      id_herb: row.id_herb || row.id_gerb, 
      herb_name: row['elm'],
      herb_value: row['value'],
      herb_img: row.herb_img,
      nature: row.Nature,
      meridian_affinity: row['Meridian Affinity'],
      flavor: row.Flavor,
      englat: row.englat
    };
    nestedData[teaid].herbs.push(herbInfo);
  });

  return nestedData;
}