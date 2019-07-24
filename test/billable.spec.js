import { mount } from '@vue/test-utils';
import Billable from '../src/components/Billable.vue';
import sheet from '../src/assets/test.csv';
import expect from 'expect';

describe('Billable', () =>{

	let wrapper;

	beforeEach(() =>{
		wrapper = mount(Billable)
	});

	it('Does not show any table on load', () =>{
		expect(wrapper.contains('table')).toBe(false);
		see('Choose');
	});

	it('Loads invoices after upload', async () =>{
		
        let { cleaned_data, projects }  = await wrapper.vm.preprocess(sheet);
        wrapper.vm.set_variables(cleaned_data, projects, 'test.csv', 'Choose another');
		expect(wrapper.contains('table')).toBe(true);
		see('Choose another');
		    
	});


	let see = (text, selector) =>{
		let wrap = selector ? wrapper.find(selector) : wrapper;
		expect(wrap.html()).toContain(text);
	}
})