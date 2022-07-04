export default {
  name: 'obj_banana',
  sprite: 'spr_banana',
  visible: true,
  solid: false,
  events: [
    {
      name: 'create',
      actions: [
        {
          name: 'move',
          applies_to: 'self',
          directions: [45, 135, 225, 315],
          speed: 12,
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
          value: 100,
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
