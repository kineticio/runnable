export interface BreadCrumb {
  key: string;
  value: string;
}

export class BreadCrumbs {
  private breadcrumbs: BreadCrumb[] = [];

  public add(key: string, value: string): void {
    this.breadcrumbs.push({ key, value });
  }

  public addList(key: string, value: string[]): void {
    this.breadcrumbs.push({ key, value: value.join(', ') });
  }

  public addObject(object: Record<string, string>): void {
    for (const [key, value] of Object.entries(object)) this.add(key, value);
  }

  public asJson(): BreadCrumb[] {
    return this.breadcrumbs;
  }
}
