export default {
  name: 'obj_bomb',
  sprite: 'spr_bomb',
  visible: true,
  solid: false,
  events: [
    {
      name: 'create',
      actions: [
        {
          name: 'jump_random',
          applies_to: 'self',
          snap_x: 0,
          snap_y: 0,
        },
      ],
    },
    {
      name: 'pressed',
      device: 'mouse',
      button: 'left',
      actions: [
        {
          name: 'play_sound',
          sound: 'snd_explode',
          loop: false,
        },
        {
          name: 'sleep',
          ms: 1000,
          redraw: true,
        },
        {
          name: 'show_highscore',
          background: 'back_wood',
          border: true,
          new_color: 'red',
          other_color: 'blue',
          fontWeight: 'bold',
          fontSize: '10px',
          fontFamily: 'arial,sans-serif'
        },
        {
          name: 'restart', 
        },
      ],
    },
  ],
};
