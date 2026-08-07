import { createCanvas } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";

async function buildHaramiLogo() {
  const size = 800;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Black & Metallic Dark Background
  const bgGradient = ctx.createRadialGradient(size / 2, size / 2, 50, size / 2, size / 2, size / 2);
  bgGradient.addColorStop(0, "#161922");
  bgGradient.addColorStop(0.6, "#0b0d12");
  bgGradient.addColorStop(1, "#050608");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);

  // Draw Subtle Golden Candlestick Chart in Background
  ctx.strokeStyle = "rgba(212, 175, 55, 0.18)";
  ctx.lineWidth = 2;
  const candleXs = [100, 160, 220, 280, 340, 460, 520, 580, 640, 700];
  candleXs.forEach((x, idx) => {
    const h = 200 + (Math.sin(idx) * 80);
    const y = 300 + (Math.cos(idx) * 60);
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x, y + 80);
    ctx.stroke();

    ctx.fillStyle = idx % 2 === 0 ? "rgba(212, 175, 55, 0.25)" : "rgba(239, 68, 68, 0.25)";
    ctx.fillRect(x - 12, y - 20, 24, 40);
  });

  // Metallic Golden Ring Centerpiece
  ctx.save();
  ctx.lineWidth = 14;
  const ringGrad = ctx.createLinearGradient(150, 150, 650, 650);
  ringGrad.addColorStop(0, "#ffe57f");
  ringGrad.addColorStop(0.3, "#d4af37");
  ringGrad.addColorStop(0.7, "#aa7c11");
  ringGrad.addColorStop(1, "#fff1b0");
  ctx.strokeStyle = ringGrad;
  ctx.beginPath();
  ctx.arc(size / 2, 340, 180, 0, Math.PI * 2);
  ctx.stroke();

  // Outer Thin Glow Ring
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
  ctx.beginPath();
  ctx.arc(size / 2, 340, 205, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Hooded Cyber Ninja Silhouette
  ctx.save();
  ctx.fillStyle = "#0c0d10";
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 4;

  // Hood Shape
  ctx.beginPath();
  ctx.moveTo(size / 2, 180); // Hood peak
  ctx.bezierCurveTo(size / 2 - 130, 210, size / 2 - 150, 360, size / 2 - 140, 420);
  ctx.bezierCurveTo(size / 2 - 80, 400, size / 2 - 40, 410, size / 2, 420);
  ctx.bezierCurveTo(size / 2 + 40, 410, size / 2 + 80, 400, size / 2 + 140, 420);
  ctx.bezierCurveTo(size / 2 + 150, 360, size / 2 + 130, 210, size / 2, 180);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Face Mask Dark
  ctx.fillStyle = "#050608";
  ctx.beginPath();
  ctx.moveTo(size / 2 - 80, 280);
  ctx.lineTo(size / 2 + 80, 280);
  ctx.lineTo(size / 2 + 60, 380);
  ctx.lineTo(size / 2, 410);
  ctx.lineTo(size / 2 - 60, 380);
  ctx.closePath();
  ctx.fill();

  // Glowing Golden Eyes
  ctx.fillStyle = "#ffd700";
  ctx.shadowColor = "#ffd700";
  ctx.shadowBlur = 15;

  // Left Eye
  ctx.beginPath();
  ctx.moveTo(size / 2 - 55, 305);
  ctx.lineTo(size / 2 - 15, 315);
  ctx.lineTo(size / 2 - 50, 325);
  ctx.closePath();
  ctx.fill();

  // Right Eye
  ctx.beginPath();
  ctx.moveTo(size / 2 + 55, 305);
  ctx.lineTo(size / 2 + 15, 315);
  ctx.lineTo(size / 2 + 50, 325);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // HARAMI AI Gold Brushed Metallic Text
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Gold Text Gradient
  const textGrad = ctx.createLinearGradient(100, 520, 700, 600);
  textGrad.addColorStop(0, "#fff2a1");
  textGrad.addColorStop(0.3, "#f39c12");
  textGrad.addColorStop(0.6, "#d4af37");
  textGrad.addColorStop(1, "#fff7cc");

  ctx.fillStyle = textGrad;
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 12;
  ctx.font = "black 900 78px sans-serif";
  ctx.fillText("HARAMI AI", size / 2, 550);

  // Subtitle Motto Banner
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 22px sans-serif";
  ctx.fillText("🧠 HARAMI AI NEVER SLEEPS", size / 2, 630);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "600 18px sans-serif";
  ctx.fillText("WE ANALYZE. WE HUNT. YOU PROFIT.", size / 2, 665);

  // Bottom Pair Tags
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("GOLD  •  BTC  •  FOREX  •  INDICES", size / 2, 720);

  ctx.restore();

  const buffer = canvas.toBuffer("image/jpeg");
  
  const publicGmc = path.join(process.cwd(), "public", "gmc_logo.jpg");
  const publicLogo = path.join(process.cwd(), "public", "logo.jpg");
  const publicHarami = path.join(process.cwd(), "public", "harami_ai_logo.jpg");

  fs.writeFileSync(publicGmc, buffer);
  fs.writeFileSync(publicLogo, buffer);
  fs.writeFileSync(publicHarami, buffer);

  console.log("Successfully generated Harami AI Gold & Black brand logos in /public!");
}

buildHaramiLogo().catch(console.error);
