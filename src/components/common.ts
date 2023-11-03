import { Context, useContext } from 'react';

export function useCheckedContext(contextType: Context<any>): any {
    const context = useContext(contextType);
    if (context === undefined) {
        throw new Error('useContext hook is being used outside its context Provider');
    }
    return context;
}
