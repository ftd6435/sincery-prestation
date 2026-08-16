# Sincery Prestations E-Commerce Style Guide

**Style Overview**:
A professional, high-contrast e-commerce design emphasizing bold brand colors (deep black and rich red) with clean white backgrounds, using subtle shadows and card-based layouts to create clear visual hierarchy optimized for product showcase and conversion.

## Colors
### Primary Colors
  - **primary-red**: `text-[#C1272D]` or `bg-[#C1272D]`
  - **primary-red-dark**: `text-[#A01F24]` or `bg-[#A01F24]`
  - **primary-red-light**: `text-[#E53238]` or `bg-[#E53238]`

### Background Colors

#### Structural Backgrounds

Choose based on layout type:

**For Vertical Layout** (Top Header + Optional Side Panels):
- **bg-nav-primary**: `bg-[#000000]` - Top header
- **bg-nav-secondary**: `bg-white border-b border-gray-200` - Inner Left sidebar (if present)
- **bg-page**: `bg-[hsla(0, 0%, 98%, 1)]` - Page background (bg of Main Content area)

**For Horizontal Layout** (Side Navigation + Optional Top Bar):
- **bg-nav-primary**: `bg-[#000000]` - Left main sidebar
- **bg-nav-secondary**: `bg-white border-b border-gray-200` - Inner Top header (if present)
- **bg-page**: `bg-[hsla(0, 0%, 98%, 1)]` - Page background (bg of Main Content area)

#### Container Backgrounds
For main content area. Adjust values when used on navigation backgrounds to ensure sufficient contrast.
- **bg-container-primary**: `bg-white`
- **bg-container-secondary**: `bg-[hsla(0, 0%, 97%, 1)]`
- **bg-container-inset**: `bg-[#C1272D]/5`
- **bg-container-accent**: `bg-[#000000]`

### Text Colors
- **color-text-primary**: `text-black/90`
- **color-text-secondary**: `text-black/65`
- **color-text-tertiary**: `text-black/45`
- **color-text-quaternary**: `text-black/30`
- **color-text-on-dark-primary**: `text-white/95` - Text on dark backgrounds and primary-red, black color surfaces
- **color-text-on-dark-secondary**: `text-white/70` - Text on dark backgrounds and primary-red, black color surfaces
- **color-text-on-red-primary**: `text-white` - Text on red backgrounds
- **color-text-link**: `text-[#C1272D]` - Links, text-only buttons without backgrounds, and clickable text in tables
- **color-text-price**: `text-[#C1272D]` - Product pricing

### Functional Colors
Use for status indicators, alerts, and functional feedback elements.
  - **color-success-default**: #10B981 - success states, in stock indicators
  - **color-success-light**: #D1FAE5 - tag/label bg
  - **color-error-default**: #EF4444 - error states, out of stock
  - **color-error-light**: #FEE2E2 - tag/label bg, alert banner bg
  - **color-warning-default**: #F59E0B - warning states, low stock
  - **color-warning-light**: #FEF3C7 - tag/label bg, alert banner bg
  - **color-info-default**: #3B82F6 - informational elements
  - **color-info-light**: #DBEAFE - tag/label bg

### Accent Colors
  - A secondary neutral palette for categorization and subtle emphasis. **Use sparingly** to maintain brand focus.
  - **accent-gray-cool**: `text-[#64748B]` or `bg-[#64748B]`
  - **accent-gray-warm**: `text-[#78716C]` or `bg-[#78716C]`
  - **accent-slate**: `text-[#475569]` or `bg-[#475569]`

### Data Visualization Charts
For data visualization charts only (analytics, sales reports).
  - Standard data colors: #E5E7EB, #D1D5DB, #9CA3AF, #6B7280, #4B5563, #374151
  - Important metrics can use: #C1272D, #A01F24, #000000, #64748B

## Typography
- **Font Stack**:
  - **font-family-base**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` — For regular UI copy
  - **font-family-brand**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` — Consistent with base for cohesive brand

- **Font Size & Weight**:

  - **Caption**: `text-sm font-normal` - Product metadata, small labels
  - **Body**: `text-base font-normal` - Product descriptions, general content
  - **Body Emphasized**: `text-base font-semibold` - Key product features
  - **Price**: `text-xl font-bold` - Product pricing
  - **Card Title / Subtitle**: `text-lg font-semibold` - Product names, category titles
  - **Page Title**: `text-2xl font-bold` - Category headers, main page titles
  - **Headline**: `text-4xl font-bold` - Hero sections, major announcements

- **Line Height**: 1.6 — Enhanced readability for product descriptions

## Border Radius
  - **Small**: 4px — Tags, small badges
  - **Medium**: 6px — Buttons, inputs
  - **Large**: 8px — Cards, product images
  - **Full**: full — Avatars, icon containers

## Layout & Spacing
  - **Tight**: 8px - Icons and text within buttons, small internal spacing
  - **Compact**: 12px - Spacing within product cards, related elements
  - **Standard**: 16px - Between product cards in grids
  - **Relaxed**: 24px - Between major product sections
  - **Section**: 48px - Between major page sections (hero, featured products, categories)


## Create Boundaries (contrast of surface color, borders, shadows)
Boundaries are created through a combination of subtle shadows for elevation and clean borders for definition, maintaining a professional e-commerce aesthetic.

### Borders
  - **Default**: 1px solid #E5E7EB (gray-200). Used for inputs, cards, product containers. `border border-gray-200`
  - **Stronger**: 1px solid #D1D5DB (gray-300). Used for active or focused states. `border border-gray-300`
  - **Accent**: 1px solid #C1272D. Used for active product selections or emphasis. `border border-[#C1272D]`

### Dividers
  - Use `border-t` or `border-b` `border-gray-200` for section separations within product listings and navigation menus.

### Shadows & Effects
  - **Subtle (Product Cards at Rest)**: `shadow-[0_1px_3px_rgba(0,0,0,0.08)]`
  - **Moderate (Hover State)**: `shadow-[0_4px_12px_rgba(0,0,0,0.12)]`
  - **Elevated (Dropdown Menus, Modals)**: `shadow-[0_8px_24px_rgba(0,0,0,0.15)]`
  - **Brand Glow (Primary CTAs)**: `shadow-[0_4px_16px_rgba(193,39,45,0.25)]`

## Visual Emphasis for Containers
When containers (tags, cards, list items, product cards) need visual emphasis to indicate priority, status, or category, use the following techniques:

| Technique | Implementation Notes | Best For | Avoid |
|-----------|---------------------|----------|-------|
| Background Tint | Slightly darker/lighter color or reduce transparency of backgrounds | Gentle, common approach for moderate emphasis needs | Heavy colors on large areas |
| Border Highlight | Use thin border with brand color (#C1272D) or increased opacity | Featured products, active selections, form validation | - |
| Glow/Shadow Effect | Use brand glow effect with low opacity for premium feel | Primary CTAs, featured products, hover states | Overuse that dilutes premium feeling |
| Status Tag/Label | Add colored tag/label inside container | Product availability, sale indicators, new arrivals | - |
| Side Accent Bar | **Left edge only**, 3px width in brand red, for **non-rounded containers** | Featured categories, selected filters | Large product cards, rounded containers |

## Assets
### Image

- For normal `<img>`: `object-cover`
- For product images with overlay text:
  - Slight overlay: `object-cover brightness-90`
  - Heavy overlay: `object-cover brightness-60`

### Icon
- Use Lucide icons from Iconify for a modern, clean outline style.
- To ensure an aesthetic layout, each icon should be centered in a square container, typically without a background, matching the icon's size.
- Use Tailwind font size to control icon size
- Example:
  ```html
  <div class="flex items-center justify-center bg-transparent w-5 h-5">
  <iconify-icon icon="lucide:shopping-cart" class="text-base"></iconify-icon>
  </div>
  ```

### Third-Party Brand Logos:
   - Use Brand Icons from Iconify.
   - Logo Example:
     Monochrome Logo: `<iconify-icon icon="simple-icons:visa"></iconify-icon>`
     Colored Logo: `<iconify-icon icon="logos:mastercard"></iconify-icon>`

### User's Own Logo:
- **Sincery Prestations Logo**: Use the provided brand logo image
- **Icon-based Fallback**: If text-only representation needed, use the circular split design concept

## Page Layout - Web

### Determine Layout Type
- Choose between Vertical or Horizontal layout based on whether the primary navigation is a full-width top header or a full-height sidebar (left/right).
- User requirements typically indicate the layout preference. If unclear, consider:
  - Marketing/content sites typically use Vertical Layout.
  - Functional/dashboard sites can use either, depending on visual style. Sidebars accommodate more complex navigation than top bars. For complex navigation needs with a preference for minimal chrome (Vertical Layout adds an extra fixed header), choose Horizontal Layout (omits the fixed top header).
- Vertical Layout Diagram:
```
┌──────────────────────────────────────────────────────┐
│  Header (Primary Nav)                                │
├──────────┬──────────────────────────────┬────────────┤
│Left      │ Sub-header (Tertiary Nav)    │ Right      │
│Sidebar   │ (optional)                   │ Sidebar    │
│(Secondary├──────────────────────────────┤ (Utility   │
│Nav)      │ Main Content                 │ Panel)     │
│(optional)│                              │ (optional) │
│          │                              │            │
└──────────┴──────────────────────────────┴────────────┘
```
- Horizontal Layout Diagram:
```
┌──────────┬──────────────────────────────┬───────────┐
│          │ Header (Secondary Nav)       │           │
│ Left     │ (optional)                   │ Right     │
│ Sidebar  ├──────────────────────────────┤ Sidebar   │
│ (Primary │ Main Content                 │ (Utility  │
│ Nav)     │                              │ Panel)    │
│          │                              │ (optional)│
│          │                              │           │
└──────────┴──────────────────────────────┴───────────┘
```

### Detailed Layout Code

**Vertical Layout**
```html
<!-- Body: Adjust width (w-[1440px]) based on target screen size -->
<body class="w-[1440px] min-h-[700px] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] leading-[1.6]">

  <!-- Header (Primary Nav): Fixed height -->
  <header class="w-full">
    <!-- Header content -->
  </header>

  <!-- Content Container: Must include 'flex' class -->
  <div class="w-full flex min-h-[700px]">
    <!-- Left Sidebar (Secondary Nav) (Optional): Remove if not needed. If Left Sidebar exists, use its ml to control left page margin -->
    <aside class="flex-shrink-0 min-w-fit">

    </aside>

    <!-- Main Content Area:
     Use Main Content Area's horizontal padding (px) to control distance from main content to sidebars or page edges.
     For pages without sidebars (like Marketing Pages, simple content pages such as help centers, privacy policies) use larger values (px-30 to px-80), for pages with sidebars (Functional/Dashboard Pages, complex content pages with multi-level navigation like knowledge base articles) use moderate values (px-8 to px-16) -->
    <main class="flex-1 overflow-x-hidden flex flex-col">
    <!--  Main Content -->

    </main>

    <!-- Right Sidebar (Utility Panel) (Optional): Remove if not needed. If Right Sidebar exists, use its mr to control right page margin -->
    <aside class="flex-shrink-0 min-w-fit">
    </aside>

  </div>
</body>
```

**Horizontal Layout**

```html
<!-- Body: Adjust width (w-[1440px]) based on target screen size. Must include 'flex' class -->
<body class="w-[1440px] min-h-[700px] flex font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,'Helvetica_Neue',Arial,sans-serif] leading-[1.6]">

<!-- Left Sidebar (Primary Nav): Use its ml to control left page margin -->
  <aside class="flex-shrink-0 min-w-fit">
  </aside>

  <!-- Content Container-->
  <div class="flex-1 overflow-x-hidden flex flex-col min-h-[700px]">

    <!-- Header (Secondary Nav) (Optional): Remove if not needed. If Header exists, use its mx to control distance to left/right sidebars or page margins -->
    <header class="w-full">
    </header>

    <!-- Main Content Area: Use Main Content Area's pl to control distance from main content to left sidebar. Use pr to control distance to right sidebar/right page edge -->
    <main class="w-full">
    </main>


  </div>

  <!-- Right Sidebar (Utility Panel) (Optional): Remove if not needed. If Right Sidebar exists, use its mr to control right page margin -->
  <aside class="flex-shrink-0 min-w-fit">
  </aside>

</body>
```

## Tailwind Component Examples (Key attributes)
**Important Note**: Use utility classes directly. Do NOT create custom CSS classes or add styles in <style> tags for the following components

### Basic

- **Button**: (Note: Use flex and items-center for the container)
  - Example 1 (Primary CTA Button):
    - button: `bg-[#C1272D] text-white hover:bg-[#A01F24] transition flex items-center justify-center rounded-md px-6 py-3 font-semibold shadow-[0_4px_16px_rgba(193,39,45,0.25)]`
      - span(button copy): whitespace-nowrap
  - Example 2 (Secondary Button):
    - button: `bg-white border border-[#C1272D] text-[#C1272D] hover:bg-[#C1272D]/5 transition flex items-center justify-center rounded-md px-6 py-3 font-semibold`
      - span(button copy): whitespace-nowrap
  - Example 3 (Text Button):
    - button: `text-[#C1272D] hover:text-[#A01F24] transition flex items-center font-semibold`
      - span(button copy): whitespace-nowrap
  - Example 4 (Icon Button):
    - button: `flex items-center justify-center w-10 h-10 rounded-md hover:bg-black/5 transition`
      - icon

- **Tag Group (Filter Tags)** (Note: `overflow-x-auto` and `whitespace-nowrap` are required)
  - container(scrollable): flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden
    - label (Tag item):
      - input: type="radio" name="category" class="sr-only peer" checked
      - div: `bg-white border border-gray-200 text-black/65 px-4 py-2 rounded-md peer-checked:bg-[#C1272D] peer-checked:text-white peer-checked:border-[#C1272D] hover:border-gray-300 transition whitespace-nowrap cursor-pointer`

### Data Entry
- **Progress bars/Slider**: `h-2 bg-gray-200 rounded-full`
  - Progress fill: `bg-[#C1272D] h-full rounded-full`

- **Checkbox**
  - label: flex items-center gap-2 cursor-pointer
    - input: type="checkbox" class="sr-only peer"
    - div: `w-5 h-5 bg-white border border-gray-300 rounded flex items-center justify-center peer-checked:bg-[#C1272D] peer-checked:border-[#C1272D] text-transparent peer-checked:text-white transition`
      - svg(Checkmark): stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" fill="none"
        - path: d="M5 13l4 4L19 7"
    - span(text): text-base

- **Radio button**
  - label: flex items-center gap-2 cursor-pointer
    - input: type="radio" name="option" class="sr-only peer"
    - div: `w-5 h-5 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center peer-checked:border-[#C1272D] transition`
      - svg(dot indicator): `fill-transparent peer-checked:fill-[#C1272D]` width="10" height="10" viewBox="0 0 10 10"
        - circle: cx="5" cy="5" r="5"
    - span(text): text-base

- **Switch/Toggle**
  - label: flex items-center gap-3 cursor-pointer
    - div: relative
      - input: type="checkbox" class="sr-only peer"
      - div(Toggle track): `w-12 h-6 bg-gray-200 rounded-full peer-checked:bg-[#C1272D] transition-colors`
      - div(Toggle thumb): `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-6 transition-transform`
    - span(text): text-base

- **Select/Dropdown**
  - Select container: `flex items-center justify-between bg-white border border-gray-200 rounded-md px-4 py-2.5 hover:border-gray-300 transition cursor-pointer`
    - text: text-base
    - Dropdown icon(square container): `flex items-center justify-center bg-transparent w-5 h-5`
      - icon: lucide:chevron-down


### Container
- **Navigation Menu - horizontal**
    - Navigation with sections/grouping:
        - Nav Container: `flex items-center justify-between w-full px-8 py-4`
        - Left Section: flex items-center gap-8
          - Logo: `flex items-center`
          - Menu Item: `flex items-center gap-2 text-white/95 hover:text-white transition font-medium`
        - Right Section: flex items-center gap-4
          - Search Icon: `flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-md transition`
          - Cart: `relative flex items-center justify-center w-10 h-10 hover:bg-white/10 rounded-md transition`
            - cart-icon: w-5 h-5
            - badge (if items): `absolute -top-1 -right-1 w-5 h-5 bg-[#C1272D] rounded-full flex items-center justify-center text-xs font-bold text-white`
          - Avatar: `flex items-center gap-2 hover:bg-white/10 rounded-md px-2 py-1 transition`
            - avatar-image: w-8 h-8 rounded-full

- **Card**
    - Example 1 (Product Card - Vertical):
        - Card: `bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition cursor-pointer`
        - Image Container: `relative w-full aspect-square`
          - Image: `object-cover w-full h-full`
          - Badge (if on sale/new): `absolute top-2 right-2 bg-[#C1272D] text-white text-xs font-bold px-2 py-1 rounded`
        - Text area: `flex flex-col gap-2 p-4`
          - card-title: `text-lg font-semibold text-black/90`
          - card-subtitle: `text-sm font-normal text-black/65`
          - price: `text-xl font-bold text-[#C1272D]`
    - Example 2 (Featured Product Card - Horizontal):
        - Card: `bg-white rounded-lg border border-gray-200 flex gap-4 overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition`
        - Image: `rounded-l-lg h-full w-48 object-cover`
        - Text area: `flex flex-col gap-3 p-6 flex-1`
          - card-title: `text-xl font-bold text-black/90`
          - card-subtitle: `text-base font-normal text-black/65`
          - price: `text-2xl font-bold text-[#C1272D]`
          - button: Primary CTA button
    - Example 3 (Category Card - Image-focused):
        - Card: `flex flex-col gap-3 cursor-pointer group`
        - Image: `rounded-lg w-full aspect-video object-cover group-hover:opacity-90 transition`
        - Text area: `flex flex-col gap-1`
          - card-title: `text-lg font-semibold text-black/90`
          - card-subtitle: `text-sm font-normal text-black/65`

## Additional Notes

- **Shopping Cart Badge**: Always display item count when cart has items, using brand red background
- **Product Availability**: Use functional colors (green for in stock, orange for low stock, red for out of stock)
- **Price Display**: Always bold and in brand red for immediate recognition
- **Hover States**: Enhance all interactive elements with subtle transitions (200-300ms) for professional feel
- **Accessibility**: Ensure all interactive elements have minimum 44x44px touch targets
- **Image Optimization**: Product images should maintain consistent aspect ratios within categories
- **CTAs**: Primary action buttons should always use the brand red with glow shadow effect for maximum conversion focus

<colors_extraction>
#C1272D
#A01F24
#E53238
#000000
#FFFFFF
#FAFAFA
#F7F7F7
#C1272D0D
#00000014
rgba(0,0,0,0.08)
rgba(0,0,0,0.12)
rgba(0,0,0,0.15)
rgba(193,39,45,0.25)
#000000E6
#000000A6
#00000073
#0000004D
#FFFFFFF2
#FFFFFFB3
#10B981
#D1FAE5
#EF4444
#FEE2E2
#F59E0B
#FEF3C7
#3B82F6
#DBEAFE
#64748B
#78716C
#475569
#E5E7EB
#D1D5DB
#9CA3AF
#6B7280
#4B5563
#374151
</colors_extraction>
