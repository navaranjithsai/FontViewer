document.addEventListener('DOMContentLoaded', function() {
    const fontUrlInput = document.getElementById('fontfromUrl');
    const fontFileInput = document.getElementById('fontFile');
    const viewBoxContainer = document.getElementById('viewBoxContainer');
    const inputContainer = document.getElementById('inputContainer');
    const sampleText = 'The quick brown fox jumps over the lazy dog.';
  
    if (fontUrlInput && fontFileInput && viewBoxContainer && inputContainer) {
        fontUrlInput.addEventListener('input', loadFontByUrl);
        fontFileInput.addEventListener('change', loadFontByFile);
  
        document.body.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            inputContainer.classList.add('dragover');
        });
  
        document.body.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            inputContainer.classList.remove('dragover');
        });
  
        document.body.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            inputContainer.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const droppedFile = files[0];
                const reader = new FileReader();
                reader.onload = function(event) {
                    const fontUrl = event.target.result;
                    loadFont(fontUrl);
                };
                reader.readAsDataURL(droppedFile);
            }
        });
    } else {
        console.error("One or more required elements not found.");
    }
    
    // Load font from url Code starts.
    // Uncomment any version if your server supports to it and Default Final Version is uncommented so if needed comment it and uncomment any version you like.

    // Version 1.0
    // This version will fetch file directly using CORS
    
    // async function loadFontByUrl() {
    //     const fontUrl = fontUrlInput.value.trim();
    //     if (fontUrl !== '') {
    //         await loadFont(fontUrl);
    //     }
    // }
    //

    //version 2.0 
    // This version uses CORS anywhere app from github https://github.com/Rob--W/cors-anywhere
    // when CORS is not available in your server this will proxied url request.

    // async function loadFontByUrl() {
    //     const url = fontUrlInput.value;
    //     const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    //     const finalUrl = proxyUrl + url;

    //     try {
    //         const font = await new Promise((resolve, reject) => {
    //             opentype.load(finalUrl, function(err, font) {
    //                 if (err) {
    //                     reject(err);
    //                 } else {
    //                     resolve(font);
    //                 }
    //             });
    //         });
    //         if (fontUrl !== '') {
    //             await loadFont(fontUrl);
    //         }
    //     } catch (error) {
    //         console.error('Font loading error:', error);
    //     }
    // }
  
    // Version 3.0
    // Checking this version with blob to fetch file and save it like temporarily and load the file

    // async function loadFontByUrl() {
    //     const fontUrl = fontUrlInput.value.trim();
    //     if (fontUrl !== '') {
    //         try {
    //             const response = await fetch(fontUrl);
    //             if (!response.ok) {
    //                 throw new Error('Network response was not ok');
    //             }
    //             const blob = await response.blob();
    //             const fontDataUrl = URL.createObjectURL(blob);
    //             await loadFont(fontDataUrl);

    //             // Clean up the blob URL after some time
    //             setTimeout(() => URL.revokeObjectURL(fontDataUrl), 10000);
    //         } catch (error) {
    //             console.error('Error fetching font file:', error);
    //         }
    //     }
    // }

    // FInal Version
    // In this function we use PHP to fetch file get the contents and send its data back to this request as file using blob.
    // This will help when your server doesn't have any suport for CORS and Proxy Server.

    async function loadFontByUrl() {
        const fontUrl = fontUrlInput.value.trim();
        if (fontUrl !== '') {
            try {
                const proxyUrl = `proxy.php?url=${encodeURIComponent(fontUrl)}`;
                const response = await fetch(proxyUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                loadFont(blobUrl);
            } catch (error) {
                console.error('Error fetching font file:', error);
            }
        }
    }

    async function loadFontByFile() {
        const files = fontFileInput.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = function(event) {
                const fontUrl = event.target.result;
                loadFont(fontUrl);
            };
            reader.readAsDataURL(file);
        }
    }
  
    async function loadFont(fontUrl) {
        // Clear previous content
        viewBoxContainer.innerHTML = '';
  
        try {
            const fontFace = new FontFace('CustomFont', `url(${fontUrl})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            await showFontInViewBox('CustomFont');
            await readFontData(fontUrl);
        } catch (error) {
            console.error('Font loading error:', error);
        }
    }
  
    async function showFontInViewBox(fontFamily) {
        const sampleElement = document.createElement('div');
        sampleElement.style.fontFamily = fontFamily;
        sampleElement.innerText = sampleText;
        viewBoxContainer.appendChild(sampleElement);
    }
  
    async function readFontData(fontUrl) {
        try {
            const font = await opentype.load(fontUrl);
            const fontInfo = {
                glyphs: getGlyphs(font),
                allText: getAllText(font),
                features: getFontFeatures(font)
            };
            displayFontData(fontInfo);
        } catch (error) {
            console.error('Error reading font data:', error);
        }
    }
  
  //   function getGlyphs(font) {
  //     const glyphs = [];
  //     if (font.tables && font.tables.cmap && font.tables.cmap.glyphIndexMap) {
  //         const cmap = font.tables.cmap.glyphIndexMap;
  //         for (const codePoint in cmap) {
  //             if (cmap.hasOwnProperty(codePoint)) {
  //                 const glyphIndex = cmap[codePoint];
  //                 const unicode = String.fromCharCode(codePoint);
  //                 glyphs.push(`Unicode: ${unicode}, Glyph Index: ${glyphIndex}`);
  //             }
  //         }
  //     } else {
  //         for (let i = 0; i < font.numGlyphs; i++) {
  //             glyphs.push(`Glyph ${i}`);
  //         }
  //     }
  //     return glyphs;
  // }
  
  function getGlyphs(font) {
    const glyphs = [];
    if (font.tables && font.tables.cmap && font.tables.cmap.glyphIndexMap) {
        const cmap = font.tables.cmap.glyphIndexMap;
        for (const codePoint in cmap) {
            if (cmap.hasOwnProperty(codePoint)) {
                const glyphIndex = cmap[codePoint];
                const unicode = String.fromCharCode(codePoint);
                glyphs.push(`<div class="glyph"><div class="unicode">${unicode}</div><div class="index">${glyphIndex}</div></div>`);
            }
        }
    } else {
        for (let i = 0; i < font.numGlyphs; i++) {
            glyphs.push(`<div class="glyph">Glyph ${i}</div>`);
        }
    }
    return glyphs;
  }
  
  
    function getAllText(font) {
        const allText = [];
        for (let i = 32; i <= 126; i++) {
            const char = String.fromCharCode(i);
            allText.push(char);
        }
        return allText;
    }
  
    function getFontFeatures(font) {
        const features = [];
        if (font.tables && font.tables.gsub) {
            for (const feature of font.tables.gsub.features) {
                features.push(feature.tag);
            }
        }
        return features;
    }
  
    function displayFontData(fontInfo) {
      const fontDataElement = document.createElement('div');
      fontDataElement.innerHTML = `
          <strong>OpenType Features Detected:</strong> ${fontInfo.features.join(', ')}
          <br><br>
          <strong>Glyphs:</strong> ${fontInfo.glyphs.map(text => `<span style="font-family: 'CustomFont';">${text}</span>`).join(', ')}
          <br><br>
          <strong>All Text:</strong> <br>
          ${fontInfo.allText.map(text => `<span style="font-family: 'CustomFont';">${text}</span>`).join('')}
      `;
      viewBoxContainer.appendChild(fontDataElement);
      viewBoxContainer.scrollTop = viewBoxContainer.scrollHeight;
  }
  });
  