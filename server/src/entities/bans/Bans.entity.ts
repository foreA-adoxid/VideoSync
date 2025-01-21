import {
    BaseEntity,
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryColumn,
} from 'typeorm'
import { User } from '../user/User.entity'

@Entity('bans')
export class BanEntity extends BaseEntity {
    @PrimaryColumn()
    uuid: string

    @Column({ type: 'json', default: [0] })
    type: number[]

    @Column({ default: 'Причина не указана.' })
    reason: string

    @Column({ type: 'bigint' })
    createdAt: number

    @OneToOne(() => User, (user) => user.id, {
        onDelete: 'CASCADE',
        cascade: true,
    })
    @JoinColumn()
    user: User
}
