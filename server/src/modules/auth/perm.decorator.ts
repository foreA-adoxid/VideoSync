import { SetMetadata } from '@nestjs/common'
import { Perm as Enum } from '../../enums/perm'

export const Perms = (...perms: Enum[]) => SetMetadata('perms', perms)
