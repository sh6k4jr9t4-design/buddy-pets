# 🐾 buddy-pets

确定性 ASCII 电子宠物系统。18 个物种，5 种稀有度，闪光变体，帽子，属性。

从 Claude Code 的 Buddy 子系统（v2.1.88 泄露源码）提取并重构。

```
  ╔══════════════════════════════╗
  ║  暴躁 火焰                     ║
  ╚══════════════════════════════╝

         /^^\  /^\
        <  ✦  ✦  >
        (   ~~   )
         `-vvvv´-

  物种       龙
  稀有度     ★★★★ 史诗
  眼睛       ✦
  帽子       巫师帽
  闪光       否

  性格       "混乱且引以为傲"

  调试力     ███████░░░  73
  耐心值     ████░░░░░░  42
  混乱度     █████████░  91
  智慧       ███░░░░░░░  35
  毒舌值     ██████░░░░  64
```

## 特性

- **确定性生成**：相同种子 → 相同宠物。用用户 ID、邮箱、任意字符串
- **18 个物种**：鸭子、大鹅、史莱姆、猫咪、龙、章鱼、猫头鹰、企鹅、乌龟、蜗牛、幽灵、六角恐龙、水豚、仙人掌、机器人、兔兔、蘑菇、胖墩
- **5 种稀有度**：普通 60%、优秀 25%、稀有 10%、史诗 4%、传说 1%
- **闪光变体**：1% 概率，金色显示
- **8 种帽子**：皇冠、礼帽、竹蜻蜓、光环、巫师帽、毛线帽、小鸭子
- **5 项属性**：调试力、耐心值、混乱度、智慧、毒舌值——含峰值/低谷机制
- **ASCII 精灵**：每种 3 帧闲置动画
- **命名**：自动生成名字，如"暴躁 火焰"或"憨憨 嘎嘎"
- **性格**："偷偷喜欢你但绝不承认"、"永远一副看透一切的表情"等
- **多语言**：内置中文、英文、日文
- **零依赖**：纯 TypeScript，无运行时依赖

## 安装

```bash
npm install buddy-pets
```

## CLI

```bash
# 孵化随机宠物
npx buddy-pets

# 中文模式
npx buddy-pets --lang zh

# 日文模式
npx buddy-pets -l ja

# 用种子确定性孵化
npx buddy-pets hatch "user-12345" --lang zh

# 指定种子抽卡
npx buddy-pets roll "hello-world"

# 批量随机宠物
npx buddy-pets multi 5

# 展示所有物种表情
npx buddy-pets face 18

# 查看可用语言
npx buddy-pets langs
```

## API

```typescript
import { roll, hatch, renderSprite, renderFace, setLocale } from 'buddy-pets'

// 设置语言
setLocale('zh')

// 确定性生成
const { bones, soul } = roll('user-12345')
console.log(soul.name)         // "暴躁 火焰"
console.log(bones.rarity)     // "rare"
console.log(bones.species)    // "dragon"
console.log(bones.shiny)      // false
console.log(bones.stats)      // { 调试力: 73, 耐心值: 42, ... }

// 带时间戳孵化
const companion = hatch('user-12345')
console.log(companion.hatchedAt) // 1712030400000

// 渲染 ASCII 精灵
const lines = renderSprite(bones, 0)
lines.forEach(line => console.log(line))

// 只渲染表情
const face = renderFace(bones)  // "<✦~✦>"

// 随机生成
import { rollRandom, hatchRandom } from 'buddy-pets'
const random = rollRandom()
```

## 自定义语言

```typescript
import { registerLocale, setLocale, type BuddyLocale } from 'buddy-pets'

const ko: BuddyLocale = {
  lang: 'ko',
  label: '한국어',
  species: { duck: '오리', dragon: '드래곤', /* ... */ },
  rarity: { common: '일반', legendary: '전설', /* ... */ },
  // ... 完整定义见 src/locales/en.ts
}

registerLocale(ko)
setLocale('ko')
```

## 种子机制

```
seed = userId + "friend-2026-401"
hash = FNV-1a(seed)
rng  = Mulberry32(hash)
```

盐值 `friend-2026-401` 是原版 Claude Code 的值——2026 年 4 月 1 日愚人节彩蛋日期。可在 `companion.ts` 中修改。

骨骼（物种、稀有度、眼睛、帽子、属性）由种子**确定性生成**。灵魂（名字、性格）也是确定性生成但独立计算。这意味着：

- 同一用户永远获得相同宠物
- 改配置无法作弊——物种/稀有度来自哈希
- 无需服务器——完全客户端确定性

## 来源

在 Claude Code v2.1.88 泄露源码的 `buddy/` 子系统中发现。原版包含：

- `types.ts` — 类型定义和常量
- `companion.ts` — Mulberry32 PRNG 抽卡逻辑
- `sprites.ts` — ASCII 精灵定义（18 种 × 3 帧）
- `CompanionSprite.tsx` — React/Ink 终端 UI
- `prompt.ts` — Claude Code 提示系统集成
- `useBuddyNotification.tsx` — React 通知钩子

此独立版本保留核心逻辑（types、companion、sprites），用 ANSI 终端渲染替代 UI 层。Claude Code 依赖已移除。

## License

MIT

---

*盐值是 `friend-2026-401`。你的鸭子诞生在愚人节。*
