export default {
  name: 'obj_music',
  sprite: null,
  visible: true,
  solid: false,
  events: [
    {
      name: 'create',
      actions: [
        {
          name: 'play_sound',
          sound: 'snd_music',
          loop: true,
        },
        {
          name: 'set_alarm',
          applies_to: 'self',
          steps: 60,
          alarm: 'alarm 0',
          relative: false
        },
      ],
    },
    {
      name: 'alarm 0',
      actions: [
        {
          name: 'create_instance',
          applies_to: 'self',
          object: 'obj_bomb', 
          x: 0,
          y: 0,
          relative: false
        },
        {
          name: 'set_alarm',
          applies_to: 'self',
          steps: 60,
          alarm: 'alarm 0',
          relative: false
        }
      ]
    }
  ],
};
