import { $, $$, decode } from '@sciter';
import { fs } from '@sys';

let SCORE = 0;

main();

function main() {
  const RESOURCES = {
    backgrounds: importFolder('backgrounds'),
    objects: importFolder('objects'),
    rooms: importFolder('rooms'),
    sounds: importFolder('sounds'),
    sprites: importFolder('sprites'),
  };

  loadRoom(RESOURCES.rooms[0], RESOURCES);
}

function loadRoom(room, RESOURCES) {
  const { caption, width, height } = room;
  adjustWindow(caption, width, height, true);
  setBackground(room.backgrounds[0], RESOURCES);
  play(room, RESOURCES);
}

async function play(room, RESOURCES) {
  const instances = await Promise.all(
    room.instances.map(async (instance) => {
      const obj = findByName(instance.object, RESOURCES.objects);
      const spr = findByName(obj.sprite, RESOURCES.sprites);

      const img =
        spr === null
          ? null
          : await Graphics.Image.load(`sprites/${spr.filename}`);

      return {
        name: obj.name,
        object: obj.name,
        sprite: obj.sprite,
        visible: obj.visible,
        solid: obj.solid,
        img,
        x: instance.x,
        y: instance.y,
        events: obj.events,
        // default values
        speed: 0,
        direction: 0,
        xSpeed: 0,
        ySpeed: 0,
        xPrevious: instance.x,
        yPrevious: instance.y,
        alarms: Array.from({ length: 12 }).fill(0),
        created: false,
      };
    })
  );

  let MOUSE_LEFT_PRESSED = false;

  document.$('#room').on('click', (evt, el) => {
    MOUSE_LEFT_PRESSED = { button: evt.button, x: evt.x, y: evt.y };
  });

  function step(progress) {
    //  ... update game state ...
    // ... compute location of objects ...
    instances.forEach((instance) => {
      if (instance.created) {
        return;
      }
      instance.created = true;
      const { events } = instance;
      const create = findByName('create', events);
      if (create !== null) {
        const { actions } = create;

        actions
          .filter((action) => action.name === 'play_sound')
          .forEach((action) => {
            const { sound, loop } = action;
            const { filename } = findByName(sound, RESOURCES.sounds);
            Audio.load(`sounds/${filename}`).then((audio) => audio.play());
          });

        actions
          .filter((action) => action.name === 'jump_random')
          .forEach((action) => {
            const { applies_to, snap_x, snap_y } = action;
            const solids = instances.filter(({ solid }) => solid);
            jumpRandom(instance, solids, RESOURCES);
          });

        actions
          .filter(({ name }) => name === 'move')
          .forEach((action) => {
            const { applies_to, directions, speed, relative } = action;
            const direction = randomFrom(directions);
            const xSpeed = speed * Math.sin(direction);
            const ySpeed = speed * Math.cos(direction);
            instance.direction = relative
              ? instance.direction + direction
              : direction;
            instance.xSpeed = relative ? instance.xSpeed + xSpeed : xSpeed;
            instance.ySpeed = relative ? instance.ySpeed + ySpeed : ySpeed;
            instance.speed = relative ? instance.speed + speed : speed;
          });

        actions
          .filter((action) => action.name === 'set_alarm')
          .forEach((action) => {
            const { applies_to, steps, alarm, relative } = action;
            const index = +alarm.match(/\d+/)[0];
            instance.alarms[index] =
              steps + (relative ? instance.alarms[index] : 0);
          });
      }
    });

    instances.forEach((instance) => {
      instance.alarms.forEach((alarm, i, alarms) => {
        if (alarms[i] > -1) {
          alarms[i]--;
        }

        if (alarm !== 0) {
          return;
        }

        const { events } = instance;
        const event = findByName(`alarm ${i}`, events);
        if (event === null) {
          return;
        }
        const { actions } = event;

        actions
          .filter((action) => action.name === 'create_instance')
          .forEach(async (action) => {
            const { applies_to, object, x, y, relative } = action;

            const instance = { object, x, y };
            const obj = findByName(instance.object, RESOURCES.objects);
            const spr = findByName(obj.sprite, RESOURCES.sprites);

            const img =
              spr === null
                ? null
                : await Graphics.Image.load(`sprites/${spr.filename}`);

            instances.push({
              name: obj.name,
              object: obj.name,
              sprite: obj.sprite,
              visible: false,
              solid: obj.solid,
              img,
              x: instance.x,
              y: instance.y,
              events: obj.events,
              // default values
              speed: 0,
              direction: 0,
              xSpeed: 0,
              ySpeed: 0,
              xPrevious: instance.x,
              yPrevious: instance.y,
              alarms: [],
            });
          });

        actions
          .filter((action) => action.name === 'set_alarm')
          .forEach((action) => {
            const { applies_to, steps, alarm, relative } = action;
            const index = +alarm.match(/\d+/)[0];
            instance.alarms[index] =
              steps + (relative ? instance.alarms[index] : 0);
          });
      });
    });

    instances.forEach((instance) => {
      const sprite = findByName(instance.sprite, RESOURCES.sprites);
      const { events } = instance;
      const pressed = findByName('pressed', events);
      if (pressed !== null) {
        const { device, button } = pressed;
        if (device === 'mouse') {
          if (button === 'left') {
            if (MOUSE_LEFT_PRESSED !== false) {
              const { x: cursorX, y: cursorY } = MOUSE_LEFT_PRESSED;
              const bBox = instanceToBoundingBox(instance, RESOURCES);
              if (pointInBBox(MOUSE_LEFT_PRESSED, bBox)) {
                const { actions } = pressed;
                actions
                  .filter((action) => action.name === 'play_sound')
                  .forEach((action) => {
                    const { sound, loop } = action;
                    const { filename } = findByName(sound, RESOURCES.sounds);
                    Audio.load(`sounds/${filename}`).then((audio) =>
                      audio.play()
                    );
                  });

                actions
                  .filter((action) => action.name === 'jump_random')
                  .forEach((action) => {
                    const { applies_to, snap_x, snap_y } = action;
                    const solids = instances.filter(({ solid }) => solid);
                    jumpRandom(instance, solids, RESOURCES);
                  });

                actions
                  .filter((action) => action.name === 'set_score')
                  .forEach((action) => {
                    const { value, relative } = action;
                    SCORE = relative ? SCORE + value : value;
                    Window.this.caption = `Score: ${SCORE}`;
                  });

                actions
                  .filter((action) => action.name === 'show_highscore')
                  .forEach((action) => {
                    const {
                      background,
                      border,
                      new_color,
                      other_color,
                      fontWeight,
                      fontSize,
                      fontFamily,
                    } = action;

                    const parameters = {
                      new_color,
                      other_color,
                      fontWeight,
                      fontSize,
                      fontFamily,
                      score: SCORE,
                      backgroundImage: `url("backgrounds/${
                        findByName(background, RESOURCES.backgrounds).filename
                      }")`,
                    };

                    showHighscore(parameters);
                  });
              }
            }
          }
        }
      }
    });

    MOUSE_LEFT_PRESSED = false;

    instances.forEach((instance) => {
      instance.xPrevious = instance.x;
      instance.yPrevious = instance.y;
      instance.x += instance.xSpeed;
      instance.y += instance.ySpeed;
    });

    instances.forEach((instance) => {
      const sprite = findByName(instance.sprite, RESOURCES.sprites);

      const { events } = instance;
      const collision = findByName('collision', events);
      if (collision !== null) {
        const { actions, other } = collision;
        const otherInstances = checkForCollisions(
          instance,
          other,
          instances,
          RESOURCES
        );

        otherInstances.forEach((other) => {
          if (other.solid) {
            instance.x = instance.xPrevious;
            instance.y = instance.yPrevious;
          }

          actions
            .filter(({ name }) => name === 'bounce')
            .forEach((action) => {
              const { applies_to, precise, solid } = action;

              if (other.x > instance.x && instance.xSpeed > 0) {
                if (
                  wouldCollide(
                    instance,
                    instance.x + instance.xSpeed,
                    instance.y,
                    other,
                    RESOURCES
                  )
                ) {
                  reverseXSpeed(instance);
                }
              }

              if (other.x < instance.x && instance.xSpeed < 0) {
                if (
                  wouldCollide(
                    instance,
                    instance.x + instance.xSpeed,
                    instance.y,
                    other,
                    RESOURCES
                  )
                ) {
                  reverseXSpeed(instance);
                }
              }

              if (other.y > instance.y && instance.ySpeed > 0) {
                if (
                  wouldCollide(
                    instance,
                    instance.x,
                    instance.y + instance.ySpeed,
                    other,
                    RESOURCES
                  )
                ) {
                  reverseYSpeed(instance);
                }
              }

              if (other.y < instance.y && instance.ySpeed < 0) {
                if (
                  wouldCollide(
                    instance,
                    instance.x,
                    instance.y + instance.ySpeed,
                    other,
                    RESOURCES
                  )
                ) {
                  reverseYSpeed(instance);
                }
              }
            });
        });
      }
    });

    // request this.paintContent() call
    this.requestPaint();
    // request this.animate() call on next VSYNC
    return true;
  }

  document.$('#room').animate(step, { FPS: room.speed });

  document.$('#room').paintContent = function (gfx) {
    //... draw game state here ...
    instances.forEach((instance) => {
      if (instance.img !== null && instance.visible) {
        gfx.draw(instance.img, {
          x: instance.x,
          y: instance.y,
        });
      }
    });
  };
}

function jumpRandom(instance, solids, RESOURCES) {
  instance.visible = false;
  const [w, h] = Window.this.box('dimension', 'client');

  const randomX = Math.round(Math.random() * w);
  const randomY = Math.round(Math.random() * h);

  instance.x = randomX;
  instance.y = randomY;

  const selfBoundingBox = instanceToBoundingBox(instance, RESOURCES);

  for (const solid of solids) {
    const otherBoundingBox = instanceToBoundingBox(solid, RESOURCES);
    if (boundingBoxesColliding(selfBoundingBox, otherBoundingBox)) {
      return jumpRandom(instance, solids, RESOURCES);
    } else {
      instance.visible = true;
    }
  }
}

function setBackground(background, RESOURCES) {
  const { filename } = findByName(background.background, RESOURCES.backgrounds);
  const backgroundImage = `url("backgrounds/${filename}")`;
  const { tile_x, tile_y } = background;

  const backgroundRepeat =
    tile_x && tile_y
      ? 'repeat'
      : tile_x
      ? 'repeat-x'
      : tile_y
      ? 'repeat-y'
      : 'no-repeat';

  document.body.style.backgroundImage = backgroundImage;
  document.body.style.backgroundRepeat = backgroundRepeat;
}

function adjustWindow(caption, width, height, center = true, x = 0, y = 0) {
  Window.this.caption = caption;
  if (center) {
    const [screenWidth, screenHeight] = Window.this.screenBox(
      'frame',
      'dimension'
    );
    x = screenWidth / 2 - width / 2;
    y = screenHeight / 2 - height / 2;
  }
  Window.this.move(x, y, width, height, true);
}

function importFolder(path) {
  let files = fs.$readdir(path);
  files = files.filter((file) => /\.js$/.test(file.name));
  const filenames = files.map(({ name }) => `${path}/${name}`);
  const objs = filenames.map(importResource);
  return objs;
}

/** e.g. resource.js => export default { foo: 'bar' } => { foo: 'bar' } */
function importResource(path) {
  const file = fs.$readfile(path, 'r');
  const string = decode(file, 'utf-8');
  const js = string
    .replace(/^export default /, '')
    .trim()
    .replace(/;$/, '');
  const obj = eval(`(${js})`);
  return obj;
}

function arrToMap(arr, key) {
  return arr.reduce((map, obj) => ({ ...map, [key]: obj }), {});
}

function findByName(name, arr) {
  return arr.find((obj) => obj.name === name) || null;
}

function randomFrom(arr) {
  return arr[~~(Math.random() * arr.length)];
}

function wouldCollide(instance, xNext, yNext, other, RESOURCES) {
  const sprite = findByName(instance.sprite, RESOURCES.sprites);
  const { width, height } = sprite;
  const bBox = {
    x1: xNext,
    y1: yNext,
    x2: xNext + width,
    y2: yNext + height,
  };

  const bBoxOther = instanceToBoundingBox(other, RESOURCES);

  return boundingBoxesColliding(bBox, bBoxOther);
}

function instanceToBoundingBox(instance, RESOURCES) {
  const sprite = findByName(instance.sprite, RESOURCES.sprites);
  const { width, height } = sprite;
  const { x, y } = instance;
  return {
    x1: x,
    y1: y,
    x2: x + width,
    y2: y + height,
  };
}

/** other is a string */
function checkForCollisions(instance, other, instances, RESOURCES) {
  const others = [];

  instances = instances
    .filter((obj) => obj !== instance)
    .filter((obj) => obj.name === other);

  const selfBoundingBox = instanceToBoundingBox(instance, RESOURCES);

  instances.forEach((obj) => {
    const otherBoundingBox = instanceToBoundingBox(obj, RESOURCES);

    const isColliding = boundingBoxesColliding(
      selfBoundingBox,
      otherBoundingBox
    );
    if (isColliding) {
      others.push(obj);
    }
  });

  return others;
}

function boundingBoxesColliding(a, b) {
  // no horizontal overlap
  if (a.x1 >= b.x2 || b.x1 >= a.x2) return false;

  // no vertical overlap
  if (a.y1 >= b.y2 || b.y1 >= a.y2) return false;

  return true;
}

function reverseXSpeed(instance) {
  instance.xSpeed = -instance.xSpeed;
  instance.direction =
    (Math.atan2(instance.xSpeed, instance.ySpeed) * 180) / Math.PI;
  instance.speed = Math.sqrt(instance.xSpeed ** 2 + instance.ySpeed ** 2);
}

function reverseYSpeed(instance) {
  instance.ySpeed = -instance.ySpeed;
  instance.direction =
    (Math.atan2(instance.xSpeed, instance.ySpeed) * 180) / Math.PI;
  instance.speed = Math.sqrt(instance.xSpeed ** 2 + instance.ySpeed ** 2);
}

function pointInBBox(point, bBox) {
  return (
    point.x >= bBox.x1 &&
    point.x <= bBox.x2 &&
    point.y >= bBox.y1 &&
    point.y <= bBox.y2
  );
}

function showHighscore(parameters) {
  const popup = Window.this.modal({
    url: 'highscore.html',
    width: 360,
    height: 400,
    type: Window.TOOL_WINDOW,
    parameters,
  });
}
