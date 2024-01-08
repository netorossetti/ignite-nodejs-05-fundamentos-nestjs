import { Encrypter } from "@/domain/forum/application/criptography/encrypter";
import { Module } from "@nestjs/common";
import { JwtEncrypter } from "./jwt-encrypter";
import { HashCompare } from "@/domain/forum/application/criptography/hash-compare";
import { BcryptHasher } from "./bcrypt-hasher";
import { HashGenerator } from "@/domain/forum/application/criptography/hash-generator";

@Module({
  providers: [
    {
      provide: Encrypter,
      useClass: JwtEncrypter,
    },
    {
      provide: HashCompare,
      useClass: BcryptHasher,
    },
    {
      provide: HashGenerator,
      useClass: BcryptHasher,
    },
  ],
  exports: [Encrypter, HashCompare, HashGenerator],
})
export class CryptographyModule {}
