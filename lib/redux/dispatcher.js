import { initializeStore }       from '@lib/redux/store';
import defaultActions            from '@lib/redux/defaultActions';
import { nsComponentDataLoader } from '@lib/utils';
import Cookies                   from 'cookies';

// Dispatch default actions and requested actions (for the current page)
// Goal : No need to dispatch "global action" in every pages :)
export const dispatcher = async (req, res, requestActions = []) => {
    // Init store for all dispatch
    const reduxStore   = initializeStore();
    const { dispatch } = reduxStore;
    let error          = false;
    let redirect       = undefined;
    
    // Default param for actions
    const defaultParams = {
        light     : false,
        lastUpdate: Date.now(),
    };

    // Merge default actions and requested actions
    let cookiesServerInstance;
    if (req && res) cookiesServerInstance = new Cookies(req, res);
    const _defaultActions = defaultActions(cookiesServerInstance); // Get all other actions
    const allActions      = requestActions ? [..._defaultActions, ...requestActions] : _defaultActions;

    // For all actions, doing the real dispatch
    let componentData = {};
    for (let index = 0; index < allActions.length; index++) {
        // Create the action to dispatch
        const action = { ...defaultParams, ...allActions[index] };

        try {
            // Execute the function
            const data = await action.func();

            dispatch({
                type      : action.type,
                light     : action.light,
                lastUpdate: action.lastUpdate,
                data
            });

            // Load component data for cms blocks and static page
            if (action.type === 'PUSH_CMSBLOCKS') {
                for (const cmsblock of data) {
                    componentData = await nsComponentDataLoader(cmsblock.content, componentData);
                }
            } else if (action.type === 'SET_STATICPAGE') {
                componentData = await nsComponentDataLoader(data.content, componentData);
            }
            if (Object.keys(componentData).length) {
                dispatch({
                    type      : 'SET_COMPONENT_DATA',
                    light     : action.light,
                    lastUpdate: action.lastUpdate,
                    data      : componentData
                });
            }
            
            
        } catch (e) {
            error = { code: e.code, message: e.name + ': ' + e.message };
            // POUR PLUS TARD en cas de requete qui renverra 401, on redirige vers le login =>
            /*if (error.code === 401) {
                redirect = {
                    permanent  : false,
                    destination: '/login',
                };
            }*/
        }
    }


    return { props: { error, initialReduxState: reduxStore.getState() }, redirect };
};
