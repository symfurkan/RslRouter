export interface IRoutes {
  path: string;
  callback?: (params: string[]) => void;
  lifecycle?: RslRouterLifecycle;
}

export interface IRouteResult {}

export class RslRouter {
  static instance?: RslRouter;
  /**
   * Singleton mimarisi
   */
  static connect() {
    if (!this.instance) {
      this.instance = new RslRouter();
    }
    return this.instance;
  }
  /**
   * AddRoute metodu ile eklenen route bilgilerinin bulunduğu array
   */
  #routes: IRoutes[] = [];
  /**
   * aktif olan url burada tutulur.
   */
  #active: string = "";

  constructor() {
    this.#active = globalThis.location.pathname;
    this.check();
  }

  /**
   * Router tüm ana işlemlerini burada gerçekleştirir hangi route'un callback'i çalışacak burada belirlenir.
   */
  private check() {
    for (const route of this.#routes) {
      const routeMatcher = new RegExp(
        route.path.replace(/:[^\s/]+/g, "([\\w-]+)")
      );
      const condition = this.#active.match(routeMatcher);
      if (condition && route.callback) {
        route.callback(condition);
      }
      if (route.lifecycle) {
        for(const action of route.lifecycle.serialize()){
          action("daha hazır değil");
        }
      }
    }
  }

  public addRoute(path: string) {
    const route = {
      path: path,
      lifecycle: new RslRouterLifecycle(),
    };
    this.#routes.push(route);
  }

  /**
   * Router hangi URL geldiğinde hangi callback çalışacak bu metod ile belirlenir.
   * Toplu Route eklemek için kullanılır.
   * @param r path ve callback bulunan obje array olarak yerleştirilir
   */
  public addRoutes(r: IRoutes[]) {
    this.#routes.push(...r);
  }

  /**
   * Bu metod ile route işlemi gerçekleşir.
   * @param path string path girilir
   */
  public route(path: string) {
    this.#active = path;
    globalThis.history.pushState("", "", path);
    this.check();
  }
}

// Daha sonra burası ayrı bir paket haline getirilecek.
export type TLifecycle = (params: any) => void;
export class RslRouterLifecycle {
  #router: RslRouter = RslRouter.connect();
  #lifecycles: TLifecycle[] = [];
  constructor() {}
  public then(callback: TLifecycle) {
    this.#lifecycles.push(callback);
    return this;
  }

  public finaly() {
    //TODO
  }
  public catch() {
    //TODO
  }

  public serialize() {
    return this.#lifecycles;
  }
}
// {END} Daha sonra burası ayrı bir paket haline getirilecek.
export default RslRouter;
