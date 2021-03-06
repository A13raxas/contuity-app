export default class Person {
  static schema = {
    name: 'Person',
    primaryKey: 'id',
    properties: {
      id: 'int',
      firstName: 'string',
      lastName: 'string?',
      jots: 'Jot[]',
      phoneNumber: 'string?',
      email: 'string?',
      picture: 'data?',
    },
  };

  constructor(firstName, lastName, phoneNumber, email) {
    this.id = Number(String(Math.random()).slice(2));
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.email = email;
  }
}
