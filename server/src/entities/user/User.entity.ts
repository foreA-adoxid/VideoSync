import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    OneToOne,
    OneToMany,
    PrimaryColumn,
} from 'typeorm'
import { BanEntity } from '../bans/Bans.entity'
import { Perm } from '../../enums/perm'
import { Video } from '../video/Video.entity'

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    username: string

    @Column()
    password: string

    @Column('json', { default: [] })
    sessions: string[]

    @Column({ nullable: true })
    createdAt: string

    @Column({ nullable: true })
    updatedAt: string

    @Column({ type: 'json', default: [] })
    ips: string[]

    @Column({ type: 'enum', enum: Perm, default: Perm.DEFAULT })
    perms: Perm

    @OneToOne(() => BanEntity, (ban) => ban.user)
    ban: BanEntity

    @OneToMany(() => Video, (video) => video.user)
    videos: Video[]
}
