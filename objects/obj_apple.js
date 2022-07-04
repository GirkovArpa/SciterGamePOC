export default {
  name: 'obj_apple',
  sprite: 'spr_apple',
  visible: true,
  solid: false,
  events: [
    {
      name: 'create',
      actions: [
        {
          name: 'move',
          applies_to: 'self',
          directions: [45, 90, 135, 180, 225, 270, 315, 360],
          speed: 8,
          relative: false,
        },
      ],
    },
    {
      name: 'collision',
      other: 'obj_wall',
      actions: [
        {
          name: 'bounce',
          applies_to: 'self',
          precise: false,
          solid: true,
        },
      ],
    },
    {
      name: 'pressed',
      device: 'mouse',
      button: 'left',
      actions: [
        {
          name: 'jump_random',
          applies_to: 'self',
          snap_x: 0,
          snap_y: 0,
        },
        {
          name: 'set_score',
          value: 50,
          relative: true,
        },
        {
          name: 'play_sound',
          sound: 'snd_click',
          loop: false,
        },
      ],
    },
  ],
};
