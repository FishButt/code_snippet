import { Action, IReducersImmer } from '../types';
import {
    SupplierActionTypes,
  } from './action-types';
import { ICountriesSuppliers } from './types';
import produce from 'immer';

export interface SupplierState {
    ...
    countries: ICountriesSuppliers | null;
  }

const initialState: SupplierState = {
    ...
    countries: null,
  };

const reducers: IReducersImmer<SupplierState> = (draft: SupplierState, state?: SupplierState) => ({
    ...
    [SupplierActionTypes.FETCH_COUNTRIES_SUCCESS]: action => {
      draft.countries = action.payload?.default || null;
    },
    ...
})

const reducer = (state: SupplierState = initialState, action: Action): SupplierState => {
    try {
      return produce(state, draft => reducers(draft, state)[action.type](action));
    } catch (err) {
      return state;
    }
  };
  
  export default reducer;