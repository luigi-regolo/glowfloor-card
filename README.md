# GlowFloor Card

[![TikTok | Segui](assets/tiktok-segui.svg)](https://www.tiktok.com/@luigi.regolo)
[![Latest release](https://img.shields.io/github/v/release/luigi-regolo/glowfloor-card?style=flat-square)](https://github.com/luigi-regolo/glowfloor-card/releases/latest)
[![License: GPL-3.0-only](https://img.shields.io/badge/license-GPL--3.0--only-blue?style=flat-square)](LICENSE)
[![HACS](https://img.shields.io/badge/HACS-Repository-41BDF5?style=flat-square)](https://my.home-assistant.io/redirect/hacs_repository/?owner=luigi-regolo&repository=glowfloor-card&category=plugin)
[![GitHub Stars](https://img.shields.io/github/stars/luigi-regolo/glowfloor-card?style=flat-square)](https://github.com/luigi-regolo/glowfloor-card/stargazers)

## Overview

**GlowFloor Card** is an interactive floorplan card for Home Assistant, designed with a minimalist interface inspired by the Edera Light and Graphite Dark visual styles.

Place discreet light markers directly on a floorplan, control individual lights, and visualize active lighting through soft, customizable glow effects.

The card includes a visual configuration editor, optional scene shortcuts, a live light counter, an all-off action, and responsive layouts for desktop, tablet, and smartphone dashboards.

GlowFloor uses existing Home Assistant entities and services without requiring additional JavaScript libraries, dedicated cloud accounts, subscriptions, or paid APIs.

## Preview

| Light | Dark |
| --- | --- |
| ![GlowFloor Card in Light mode](assets/glowfloor-light.png) | ![GlowFloor Card in Dark mode](assets/glowfloor-dark.png) |

![GlowFloor Card while dragging a marker to dim a light](assets/glowfloor-dimming-light.png)

*Screenshots use the built-in sample floorplan and example entities. The card follows the Home Assistant theme; dragging a marker shows the brightness before it is applied, and an amber dot marks a light left on in an empty room.*

## Features

- **Interactive floorplan:** Use the built-in sample, or select custom images through Home Assistant, with separate Light and Dark versions.
- **Light and Dark floorplans:** The image follows the active theme. If only one image is set, it is used in both modes. The editor warns when the two images have different aspect ratios.
- **Marker styles:** Choose Full (disc with border), Compact, or Icon only. Marker size is adjustable from 26 to 76 px (Full) or 16 to 76 px (Compact and Icon only).
- **Touch-friendly controls:** A minimum 44 × 44 px interaction area, independently of the visible marker size.
- **Marker icons:** Use the GlowFloor bulb, the icon of the Home Assistant entity, or a custom icon, globally or per light.
- **Light states:** Neutral sage-grey markers for inactive lights and soft champagne styling for active lights.
- **Lighting effects:** Optional diffuse illumination following a light's brightness and RGB color, or its color temperature when no RGB color is reported.
- **Drag to dim (optional):** Drag a marker horizontally to set brightness; a short tap still toggles the light. Arrow keys are supported.
- **Empty-room indicator (optional):** Link a presence sensor to a light; if the room stays empty for the configured time, the light is flagged and a button turns off all flagged lights. Nothing is switched off automatically.
- **Adjustable light area:** Configure the glow spread individually for each light, from 12% to 75%.
- **Contextual labels:** Show light names during interaction by default, with always-visible and always-hidden alternatives.
- **Live light counter:** Display the number of distinct configured lights currently switched on.
- **All-off control:** Turn off configured lights that are currently on.
- **Show/hide floorplan:** Temporarily hide the floorplan without removing its configuration.
- **Optional scenes:** Add up to three Home Assistant scenes with customizable button labels.
- **Visual configuration:** Five organized editor sections, native Home Assistant entity selectors, and touch-based marker positioning.
- **Responsive appearance:** Automatic, Light, and Dark display modes.
- **Configuration compatibility:** Existing configurations keep their marker style, positions, sizes, and icons; new features are off unless enabled.

## Installation

### HACS (Recommended)

Install GlowFloor Card directly from the default HACS catalog.

[![Open GlowFloor Card in HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=luigi-regolo&repository=glowfloor-card&category=plugin)

1. Open **HACS** in Home Assistant.
2. Search for **GlowFloor Card**.
3. Select **GlowFloor Card** from the results.
4. Click **Download** to install the card.
5. Reload your dashboard if necessary.
6. Add **GlowFloor Card** to your dashboard and configure it using the visual editor.

To install a specific release, use **Download** or **Redownload** and select the desired version when available.

### Alternative: Custom repository

If you prefer to add the repository manually:

1. Open **HACS** and select **Custom repositories** from the menu.
2. Enter `https://github.com/luigi-regolo/glowfloor-card`.
3. Select **Dashboard** as the repository type and add it.
4. Find **GlowFloor Card** in HACS and download it.

### Manual installation

1. Download [`dist/glowfloor-card.js`](dist/glowfloor-card.js).
2. Copy the file into `/config/www/` in Home Assistant.
3. Under **Settings → Dashboards → Resources**, add `/local/glowfloor-card.js` as a **JavaScript module**.
4. Reload the dashboard.
5. Add `custom:glowfloor-card` and configure it.

If the `www` directory was newly created, Home Assistant may need a restart before the file becomes available.

## Configuration and Usage

### Visual editor

GlowFloor Card can be configured entirely through the Home Assistant interface without writing YAML.

The editor contains five sections:

| Section | Configuration |
| --- | --- |
| **Piantina (Floorplan)** | Select or upload separate Light and Dark floorplans, preview either theme, restore the sample image, and position markers directly on the image. |
| **Luci (Lights)** | Add `light.*` entities, customize their names, and configure glow area, optional marker size, marker icon, and an optional presence sensor. |
| **Scene (Scenes)** | Add up to three `scene.*` entities and customize their labels. |
| **Aspetto (Appearance)** | Configure header text, display theme, marker style, icon source, marker size, light effects, label visibility, drag to dim, and the empty-room delay. |
| **Avanzate (Advanced)** | Adjust marker coordinates and configure Light and Dark floorplan paths manually. |

### Marker configuration

`marker_style` accepts `chip` (Full), `compact`, or `icon`. When omitted, `chip` is used, so existing cards look unchanged. Cards created from the visual editor start with `compact`.

| Style | Default size | Allowed size |
| --- | --- | --- |
| `chip` | 28 px | 26–76 px |
| `compact` | 20 px | 16–76 px |
| `icon` | 18 px | 16–76 px |

The interactive button area remains at least **44 × 44 px**. Individual marker sizes override the global setting. The illuminated area is configured separately and does not change the marker dimensions.

### Optional YAML configuration

The visual editor is recommended. YAML remains available for advanced configuration.

```yaml
type: custom:glowfloor-card
title: Floorplan
eyebrow: ""
subtitle: ""
theme_mode: auto
label_mode: interaction
spill_enabled: true
marker_style: compact
marker_size: 20
icon_mode: entity        # entity | default
dim_gesture: true        # drag a marker to dim; default: false
empty_delay: 10          # minutes, 1-240
image: /local/floorplans/example.png
image_dark: /local/floorplans/example-dark.png
lights:
  - entity: light.example_living_room
    name: Living room
    x: 40
    y: 55
    spread: 32
    icon_source: custom  # entity | custom | default (optional)
    icon: mdi:ceiling-light
    presence_entity: binary_sensor.example_living_room_presence
scenes:
  - entity: scene.example_relax
    name: Relax
```

Replace the example entities and image paths with valid values from your Home Assistant instance.

Marker coordinates (`x` and `y`) use percentages from 0 to 100. The `spread` value accepts 12–75%. `presence_entity` must be a `binary_sensor.*` entity: a light is flagged as left on in an empty room when the sensor has been `off` for at least `empty_delay` minutes. Drag to dim only applies to lights that support brightness.

### Card controls

| Interaction | Result |
| --- | --- |
| Tap or click a light marker | Toggle the associated light. |
| Drag a marker left or right (if enabled) | Set brightness; applied on release. |
| Arrow keys on a focused marker (if enabled) | Adjust brightness in 5% steps. |
| Long-press or right-click a marker | Open its Home Assistant entity details. |
| **Spegni tutto** | Turn off configured lights that are currently on. |
| **Spegni stanze vuote (N)** | Turn off the N lights flagged as empty-room. Shown only when at least one is flagged. |
| **Nascondi piantina / Mostra piantina** | Temporarily hide or show the floorplan. |
| Select a scene | Activate the associated Home Assistant scene. |

## Compatibility and Requirements

- Home Assistant with support for custom JavaScript dashboard cards.
- Existing `light.*` entities for light control.
- Optional `scene.*` entities for scene shortcuts.
- Optional `binary_sensor.*` entities for empty-room detection.
- Home Assistant media access and suitable permissions when selecting or uploading images.
- HACS for repository-based installation, or manual JavaScript module installation.

No specific minimum Home Assistant version has been independently verified.

GlowFloor relies on Home Assistant's existing entities, services, and permissions. It does not introduce telemetry, advertising, or dedicated paid cloud services.

For private floorplans, use images hosted within your Home Assistant instance rather than external image-hosting services.

## Releases

See [GitHub Releases](https://github.com/luigi-regolo/glowfloor-card/releases) for published stable and pre-release versions.

## Copyright & License

Copyright © 2026 luigi-regolo.

Original project created and maintained by **luigi-regolo**.

Licensed under the **GNU General Public License version 3 only (GPL-3.0-only)**. See [LICENSE](LICENSE) for the complete terms.

The software is provided without warranty to the extent permitted by applicable law.
