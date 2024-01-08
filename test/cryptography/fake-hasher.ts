import { HashCompare } from "@/domain/forum/application/criptography/hash-compare";
import { HashGenerator } from "@/domain/forum/application/criptography/hash-generator";

export class FakeHasher implements HashGenerator, HashCompare {
  async hash(plain: string): Promise<string> {
    return plain.concat("-hashed");
  }
  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat("-hashed") === hash;
  }
}
