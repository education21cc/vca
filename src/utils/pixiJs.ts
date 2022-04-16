import { Loader } from "pixi.js";

interface Location {
    x: number;
    y: number;
}

export const lerpLocation = (point1: Location, point2: Location, alpha: number): Location => {
    const x = lerp(point1.x, point2.x, alpha);
    const y = lerp(point1.y, point2.y, alpha);
    return { x, y };
}

const lerp = (n1: number,  n2: number,  alpha: number) =>  {
    return n1 + alpha * (n2 - n1);
}
const diffLocation = (point1: Location, point2: Location): Location => {
  return {
    x: point2.x - point1.x,
    y: point2.y - point1.y
  }
}



// Uses the shared pixi loader to load a resource
export async function loadResourceAsync(path: string) {
    const loader = Loader.shared;
    return new Promise<any>((resolve, reject) => {
    if (loader.resources[path]) {
            resolve(loader.resources[path]);
        }
        else {
            loader.add(path).load((_, resources) => {
                resolve(resources[path]);
            });
        }
    });
}

export const loadResource = (path: string, callback: (resource: any) => void) => {
    const loader = Loader.shared;
    if (loader.resources[path]) {
        callback(loader.resources[path]);
        return;
    }
    loader.add(path).load((_, resources) => { callback(resources[path]!)});
}
