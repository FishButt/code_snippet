import { from, Observable, of } from 'rxjs';
import { IEpicDeps } from 'lib/types';
import { catchError, map, mergeMap, withLatestFrom } from 'rxjs/operators';
import { ofType } from 'redux-observable';
import { appError } from '../../app/actions';
import { Countries } from '@aa/models';
import { IFetchCountries, SupplierActionTypes } from '../action-types';

export const fetchCountriesEpic = (
  action$: Observable<IFetchCountries>,
  { state$ }: IEpicDeps
) =>
  action$.pipe(
    ofType(SupplierActionTypes.FETCH_COUNTRIES),
    withLatestFrom(state$),
    mergeMap(([_, state]) => {
      const country = state.supplier?.supplier?.l10n?.country || 'GB';

      const promise = Countries._.getById(country).getSupplier();

      return from(promise).pipe(
        map((data) => ({
          type: SupplierActionTypes.FETCH_COUNTRIES_SUCCESS,
          payload: data,
        })),
        catchError((error) => of(appError({ error, feature: 'Supplier' })))
      );
    })
  );
