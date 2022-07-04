export default {
  name: 'room0',
  caption: '',
  width: 640,
  height: 480,
  speed: 30,
  backgrounds: [
    {
      name: 'background0',
      draw_background_color: true,
      color: 'rgb(192, 192, 192)',
      visible: true,
      foreground_image: false,
      background: 'back_wood',
      tile_x: true,
      tile_y: true,
      stretch: false,
      x_speed: 0,
      y_speed: 0,
    },
  ],
  instances: [
    ...Array.from({ length: 20 })
      .fill(0)
      .map((_, i) => ({ object: 'obj_wall', x: i * 32, y: 0 })),

    ...Array.from({ length: 20 })
      .fill(0)
      .map((_, i) => ({ object: 'obj_wall', x: i * 32, y: 448 })),

    ...Array.from({ length: 13 })
      .fill(0)
      .map((_, i) => ({ object: 'obj_wall', x: 0, y: 32 + i * 32 })),

    ...Array.from({ length: 13 })
      .fill(0)
      .map((_, i) => ({ object: 'obj_wall', x: 608, y: 32 + i * 32 })),

    { object: 'obj_music', x: 32, y: 32 },

    { object: 'obj_apple', x: 128, y: 128 },
    { object: 'obj_apple', x: 320, y: 352 },

    { object: 'obj_cherry', x: 64, y: 192 },
    { object: 'obj_cherry', x: 256, y: 64 },
    { object: 'obj_cherry', x: 416, y: 288 },

    { object: 'obj_banana', x: 448, y: 64 },
    { object: 'obj_banana', x: 224, y: 320 },

    { object: 'obj_strawberry', x: 320, y: 128 },
    { object: 'obj_strawberry', x: 512, y: 320 },

    { object: 'obj_bomb', x: 160, y: 256 },
    { object: 'obj_bomb', x: 448, y: 160 },
  ],
};
