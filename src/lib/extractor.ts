const LANG_SYMBOL = 'S'; // Spanish

interface MediaData {
  title: string;
  vttUrl: string | null;
}

function cleanFileName(name: string): string {
  return name.replace(/[\\/*?:"<>|]/g, '');
}

function convertVttToText(vttContent: string): string {
  const lines = vttContent.split('\n');
  const textLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines, headers, timestamps, and sequence numbers
    if (!trimmed) continue;
    if (trimmed.startsWith('WEBVTT') || trimmed.startsWith('NOTE')) continue;
    if (trimmed.includes('-->')) continue;
    if (/^\d+$/.test(trimmed)) continue;

    // Clean HTML tags
    const cleaned = trimmed.replace(/<[^>]+>/g, '');

    if (cleaned) {
      textLines.push(cleaned);
    }
  }

  // Join all text into a single block
  let fullText = textLines.join(' ');

  // Clean up multiple spaces
  fullText = fullText.replace(/\s+/g, ' ');

  // Fix punctuation spacing
  fullText = fullText.replace(/ ,/g, ',').replace(/ \./g, '.');

  return fullText.trim();
}

export async function extractFromUrl(url: string): Promise<{ title: string; content: string } | null> {
  // Extract media key from URL
  const cleanUrl = url.split('?')[0].trim();
  const match = cleanUrl.match(/\/([^/]+)$/);

  if (!match) {
    throw new Error('URL no válida');
  }

  const mediaKey = match[1];

  // Call the mediator API
  const apiUrl = `https://b.jw-cdn.org/apis/mediator/v1/media-items/${LANG_SYMBOL}/${mediaKey}?clientType=www`;

  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Video no encontrado');
    }
    throw new Error(`Error: ${response.status}`);
  }

  const data = await response.json();

  const mediaList = data.media || [];
  if (mediaList.length === 0) {
    throw new Error('No se encontró contenido multimedia');
  }

  const mediaItem = mediaList[0];
  const title = mediaItem.title || mediaKey;
  let vttUrl: string | null = null;

  // Look for subtitles
  if (mediaItem.subtitles?.url) {
    vttUrl = mediaItem.subtitles.url;
  } else if (mediaItem.files) {
    for (const file of mediaItem.files) {
      if (file.subtitles?.url) {
        vttUrl = file.subtitles.url;
        break;
      }
    }
  }

  if (!vttUrl) {
    throw new Error('No hay subtítulos disponibles');
  }

  // Download VTT content
  const vttResponse = await fetch(vttUrl);
  if (!vttResponse.ok) {
    throw new Error('Error descargando subtítulos');
  }

  const vttContent = await vttResponse.text();
  const content = convertVttToText(vttContent);

  return {
    title: cleanFileName(title),
    content,
  };
}

export function downloadAsTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
