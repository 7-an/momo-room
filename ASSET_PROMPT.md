# 角色素材记录

`assets/character.png` 使用内置 imagegen 工具，参考用户提供的三张照片生成。原始照片没有放入项目或公开仓库。

本版本角色为透明背景的 2 × 2 状态图：日常、开心、吃点心、睡觉。网页通过切换状态图和动作动画呈现 3D 风格互动，尚未使用可旋转的实时三维模型。

## 生成提示词

```text
Use case: stylized-concept. Asset: game character sprite sheet for a cute virtual companion web game.
Input images 1 and 3: reference for the blonde subject's curled golden blonde hair, wispy bangs, big dark eyes, soft rounded cheeks and delicate cream lace outfit with a bow. Image 2: foreground subject is supporting reference for gentle smile and face proportions; use blonde hairstyle from images 1 and 3. Do not reproduce any bystanders or backgrounds.
Create an ORIGINAL adorable stylized 3D chibi toy girl based on the supplied references, recognizable through hair and facial features but a playful virtual character, full body, oversized round head about half the height, tiny body, cream lace dress, large pale hair bow, small cream shoes, warm rosy cheeks, glossy brown eyes, fluffy golden blonde long wavy hair. High quality clay / soft vinyl 3D render, warm soft studio lighting, charming cozy game aesthetic, detailed hair strands and fabric with restrained detail.
Output a perfectly regular 2 by 2 sprite sheet on a truly transparent background. Four cells identical square dimensions, no gutters, no borders, no text. Each cell contains exactly one full body SAME character, character centered horizontally and feet placed at same height, with comfortable padding on every side. Character fills about 85 percent of cell height and 65 percent of width. Top left: neutral standing pose, hands resting at sides, eyes open, small friendly smile. Top right: delighted, smiling with eyes happily closed, hands next to cheeks. Bottom left: standing holding a tiny strawberry pastry near mouth, happy eating expression. Bottom right: sitting curled up comfortably, head tilted, eyes closed, sleepy, hugging a tiny cream cushion. Same costume, colors, head size and lighting in all cells. Nothing extends across cell boundaries. No ground plane, no scenery, no lettering, no checkerboard painted into image, no logos. Real alpha transparency.
```
