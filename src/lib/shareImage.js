import { toPng } from "html-to-image";

export async function shareIdeaAsImage(cardNode, idea) {
  const dataUrl = await toPng(cardNode, { pixelRatio: 2 });
  const blob = await (await fetch(dataUrl)).blob();
  const fileName = `${idea.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
  const file = new File([blob], fileName, { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: idea.title,
      text: `${idea.title} — fused with SynapseScape`,
    });
  } else {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  }
}