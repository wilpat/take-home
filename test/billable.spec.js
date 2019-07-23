import { mount } from '@vue/test-utils';
import Billable from '../src/components/Billable.vue';
import expect from 'expect';

describe('Billable', () =>{

	let wrapper;

	beforeEach(() =>{
		wrapper = mount(Billable)
	});

	//The value in the count data property
	it('Does not show any table on load', () =>{
		expect(wrapper.contains('table')).toBe(false);
	});


})