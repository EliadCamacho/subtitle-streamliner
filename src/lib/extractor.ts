const LANG_SYMBOL = 'S'; // Spanish
const CORS_PROXY = 'https://corsproxy.io/?';

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

function extractMediaKey(url: string): string | null {
  // Clean the URL
  const cleanUrl = url.split('?')[0].trim();
  
  // Try different URL patterns
  // Pattern 1: /finder?lank=... format - extract lank parameter
  const lankMatch = url.match(/[?&]lank=([^&]+)/i);
  if (lankMatch) {
    return lankMatch[1];
  }
  
  // Pattern 2: Direct media key in path like /es/video/pub-mwbv_202412_4_VIDEO
  const pubMatch = cleanUrl.match(/\/(pub-[^/]+)/i);
  if (pubMatch) {
    return pubMatch[1];
  }
  
  // Pattern 3: docid parameter
  const docidMatch = url.match(/[?&]docid=([^&]+)/i);
  if (docidMatch) {
    return docidMatch[1];
  }
  
  // Pattern 4: Last segment of path
  const pathMatch = cleanUrl.match(/\/([^/]+)$/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  return null;
}

export async function extractFromUrl(url: string): Promise<{ title: string; content: string } | null> {
  console.log('Extracting from URL:', url);
  
  const mediaKey = extractMediaKey(url);
  console.log('Extracted media key:', mediaKey);

  if (!mediaKey) {
    throw new Error('URL no válida - no se pudo extraer el identificador del video');
  }

  // Call the mediator API through CORS proxy
  const apiUrl = `${CORS_PROXY}${encodeURIComponent(`https://b.jw-cdn.org/apis/mediator/v1/media-items/${LANG_SYMBOL}/${mediaKey}?clientType=www`)}`;
  
  console.log('Fetching API:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Video no encontrado. Verifica que el enlace sea correcto.');
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);

    const mediaList = data.media || [];
    if (mediaList.length === 0) {
      throw new Error('No se encontró contenido multimedia en este enlace');
    }

    const mediaItem = mediaList[0];
    const title = mediaItem.title || mediaKey;
    let vttUrl: string | null = null;

    // Look for subtitles in different locations
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

    console.log('VTT URL found:', vttUrl);

    if (!vttUrl) {
      throw new Error('Este video no tiene subtítulos disponibles');
    }

    // Download VTT content through CORS proxy
    const vttProxyUrl = `${CORS_PROXY}${encodeURIComponent(vttUrl)}`;
    console.log('Fetching VTT:', vttProxyUrl);
    
    const vttResponse = await fetch(vttProxyUrl);
    if (!vttResponse.ok) {
      throw new Error('Error descargando subtítulos');
    }

    const vttContent = await vttResponse.text();
    console.log('VTT content length:', vttContent.length);
    
    const content = convertVttToText(vttContent);

    if (!content || content.length === 0) {
      throw new Error('El archivo de subtítulos está vacío');
    }

    return {
      title: cleanFileName(title),
      content,
    };
  } catch (error) {
    console.error('Extraction error:', error);
    throw error;
  }
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
