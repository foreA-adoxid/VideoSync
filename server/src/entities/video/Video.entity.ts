import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm'
import { User } from '../user/User.entity'

@Entity()
@Unique(['hash'])
export class Video {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({ nullable: true })
    description: string

    @Column()
    filePath: string

    @Column()
    hash: string

    @ManyToOne(() => User, (user) => user.videos, { onDelete: 'CASCADE' })
    user: User
}
