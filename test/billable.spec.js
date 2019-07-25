import { mount, shallowMount } from '@vue/test-utils';
import Billable from '../src/components/Billable.vue';
import { Table } from 'buefy/dist/components/table'
import sheet from '../src/assets/test.csv';
import expect from 'expect';

describe('Billable', () =>{

	let wrapper;

	beforeEach(() =>{
		wrapper = shallowMount(Billable, {
				  stubs: {
				    'b-table': Table,
				    'b-table-column': true
				  }
				});
	});

	it('is called', () => {
        expect(wrapper.name()).toBe('Billable')
        expect(wrapper.isVueInstance()).toBeTruthy()
    })

	it('Does not show any table on load', () =>{
		expect(wrapper.contains('table')).toBe(false);
		see('Choose');
	});

	it('Loads invoices after upload', async () =>{
		
        let { cleaned_data, projects }  = await wrapper.vm.preprocess(sheet);
        await wrapper.vm.set_variables(cleaned_data, projects, 'test.csv', 'Choose another');
		expect(wrapper.contains('table')).toBe(true);
		see('Choose another');
		    
	});


	let see = (text, selector) =>{
		let wrap = selector ? wrapper.find(selector) : wrapper;
		expect(wrap.html()).toContain(text);
	}
})