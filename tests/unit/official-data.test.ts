import {describe,it,expect} from 'vitest';
import rules from '../../public/data/visa-rules.json';
import passports from '../../public/data/passports.json';
import {getVisaRule} from '@/lib/visa-data';
import type {VisaRulesMap} from '@/lib/constants';

const data=rules as VisaRulesMap;
describe('published official-source dataset',()=>{
 it('publishes source-checked records only, preserving every passport and explicit gaps',()=>{
  expect(Object.keys(data).sort()).toEqual(passports.map(p=>p.code).sort());
  let pairs=0;for(const [passport,destinations] of Object.entries(data))for(const [destination,rule] of Object.entries(destinations)){
   expect(destination).not.toBe(passport);expect(getVisaRule(data,passport,destination)).toEqual(rule);
   expect(rule.approvedBy).toBe('factory-official-source-review-v1');pairs++;
  }
  expect(pairs).toBeGreaterThan(1000);expect(pairs).toBeLessThan(9700);
  expect(getVisaRule(data,'US','NP')).toBeNull();
 });
 it('preserves material country and passport exceptions',()=>{
  expect(getVisaRule(data,'US','FR')).toMatchObject({category:'visa_free',duration:90});
  expect(getVisaRule(data,'FR','DE')?.duration).toBeUndefined();
  expect(getVisaRule(data,'TH','JP')).toMatchObject({category:'visa_free',duration:15});
  expect(getVisaRule(data,'TH','JP')?.notes).toContain('ICAO');
  expect(getVisaRule(data,'IN','SG')).toMatchObject({category:'visa_required'});
  expect(getVisaRule(data,'US','SG')?.duration).toBeUndefined();
  expect(getVisaRule(data,'US','MV')?.duration).toBeUndefined();
  expect(getVisaRule(data,'IL','MV')).toBeNull();
  expect(getVisaRule(data,'CN','IN')).toBeNull();
  expect(getVisaRule(data,'US','IN')).toMatchObject({category:'evisa'});
  expect(getVisaRule(data,'US','IN')?.notes).toContain('Pakistani origin');
  expect(getVisaRule(data,'CN','JP')).toMatchObject({category:'visa_required'});
 });
});
