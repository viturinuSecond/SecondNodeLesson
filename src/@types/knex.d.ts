declare module 'knex/types/tables' {
    export interface Tables {
        user: {
            id: number;
            name: string;
            email: string;
            password: string;
            created_at: string;
            updated_at?: string;
            session_id?: string;
        },
        meal: {
            id: number;
            name: string;
            description: string;
            time: string;
            onDiet: boolean;
            user_id: string;
        }
    }
}