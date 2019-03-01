import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormControl, NgForm, Validators} from '@angular/forms';
import { GetChangesService } from '../../_messages/getchanges.service';
import { interval } from "rxjs/internal/observable/interval";
import { HandleActions } from "../../_actions/handleactions";
import { GetActionsService } from '../../_messages/getactions.service';
import { DatapageService } from '../../_services/datapage.service';
import { ReferenceHelper } from '../../_helpers/reference-helper';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
})
export class RadioComponent implements OnInit {

  @Input() fieldComp: any;
  @Input() formGroup: FormGroup;
  @Input() noLabel: boolean;
  @Input() CaseID: string;



  fieldControl = new FormControl('', null);
  options: Array<Object>;

  reference: string;
  valueReadonly$: string;
  radioClass$: string = "pega-radio-veritcal";
  showLabel$: boolean = false;

  actionsHandler: HandleActions;

  constructor(private gcservice: GetChangesService,
              private gaservice: GetActionsService,
              private dpservice: DatapageService,
              private refHelper: ReferenceHelper) { 

    this.actionsHandler = new HandleActions(gaservice);

  }

  ngOnInit() {
    this.fieldControl = new FormControl( [ this.fieldComp.value ]);
    this.reference = this.fieldComp.reference;

    // create controlName so can be refrenced from elsewhere
    this.fieldComp.controlName = this.refHelper.getControlNameFromReference(this.fieldComp.reference);

    if (this.noLabel) {
      this.fieldComp.label = "";
      this.showLabel$ = false;
    }
    else {
      if (this.fieldComp.label != "" ) {
        this.showLabel$ = true;
      }
      else if (this.fieldComp.label == "" && this.fieldComp.labelReserveSpace) {
        this.showLabel$ = true;
      }
    }

    if (this.fieldComp.control.modes[0].orientation === "horizontal") {
      this.radioClass$ = "pega-radio-horizontal";
    }

    if (this.fieldComp.control.modes[0].listSource === "datapage") {
      // handle data page
      let dataPageName = this.fieldComp.control.modes[0].dataPageID || this.fieldComp.control.modes[0].dataPage;
      this.dpservice.getDataPage(dataPageName, null).subscribe(
        response => {
          try {
            let results: any = response.body["pxResults"];
            let entryValue = this.fieldComp.control.modes[0].dataPagePrompt;
            let entryKey = this.fieldComp.control.modes[0].dataPageValue;

            this.options = new Array();
            for (let result of results) {
              let option = new Object;
              option["key"] = result[entryKey];
              option["value"] = result[entryValue];
              this.options.push(option);
            }
            
            this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);

          }
          catch (ex) {

          }
        },
        err => {

        }
      );

      
    }
    else if (this.fieldComp.control.modes[0].listSource === "locallist") {

      this.options = this.fieldComp.control.modes[0].options;

      this.valueReadonly$ = this.getOptionValue(this.fieldComp.value);
    }


    if (this.fieldComp.required) {
      this.fieldControl.setValidators([Validators.required]);
    }

    if (this.fieldComp.disabled) {
      this.fieldControl.disable();
    }

    this.formGroup.addControl(this.fieldComp.controlName, this.fieldControl);
    this.fieldControl.setValue(this.fieldComp.value);

    if (this.fieldComp.validationMessages != "") {
      var timer = interval(100).subscribe(() => {
        this.fieldControl.setErrors({'message': true});
        this.fieldControl.markAsTouched();

        timer.unsubscribe();
        });
    
    }
   

  }

  ngOnDestroy() {
    this.formGroup.removeControl(this.fieldComp.controlName);

    this.actionsHandler = null;
    delete this.actionsHandler;
  }

  getOptionValue(value: string): string {
      for (let obj of this.options) {
        if (obj["key"] === value) {
          return obj["value"];
        }
      }

      return "";
  }

  isSelected(buttonValue:string): boolean {
    if (this.fieldComp.value === buttonValue) {
      return true;
    }

    return false;
  }

  fieldChanged(e) {

    this.gcservice.sendMessage(this.reference, e.value, this.CaseID);

    this.actionsHandler.generateActions("change", this.fieldComp.control.actionSets, this.CaseID);
  }

  getErrorMessage() {
    let errMessage : string = "";


    // look for validation messages for json, pre-defined or just an error pushed from workitem (400)
    if (this.fieldControl.hasError('message')) {
      errMessage = this.fieldComp.validationMessages;
    }
    else if (this.fieldControl.hasError('required')) {
      errMessage = 'You must select a value';
    }
    else if (this.fieldControl.errors) {
      errMessage = this.fieldControl.errors.toString();

    }
 

    return errMessage;
  }

}

export function determineValues(val: any): string {
  if (val.constructor.name === 'array' && val.length > 0) {
     return '' + val[0];
  }
  return '' + val;
}
