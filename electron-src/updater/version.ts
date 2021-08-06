export class Version {
  public major: number;
  public minor: number;
  public patch: number;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  public static fromString(s: string): Version {
    let points: string[] | number[] = s.split(".");
    if (points.length !== 3) {
      return new Version(0, 0, 0);
    }
    points = points.map((x) => parseInt(x));
    return new Version(points[0], points[1], points[2]);
  }

  public isDifferentThan(other: Version): boolean {
    return (
      this.major !== other.major ||
      this.minor !== other.minor ||
      this.patch !== other.patch
    );
  }
}
