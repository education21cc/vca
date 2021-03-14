import { useApp } from '@inlet/react-pixi';

export const Test = () => {
  const app = useApp()
  app.loader.add('https://pixijs.io/examples/examples/assets/spritesheet/fighter.json')
    .load(() => {
  });
  return null
}