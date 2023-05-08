import { generateSnowflakeId, camelCaseKeys } from './utils';

describe('Utils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should generate snowflake id', () => {
    jest.useFakeTimers();

    // 12 characters
    jest.setSystemTime(new Date('2024-02-09 16:00:00').getTime());
    let id = generateSnowflakeId();
    expect(id.length).toBe(12);

    // 13 characters
    jest.setSystemTime(new Date('2058-11-29 22:00:00').getTime());
    id = generateSnowflakeId();
    expect(id.length).toBe(13);
  });

  describe('camelCaseKeys', () => {
    it('should convert object keys to camel case', () => {
      const input = {
        first_name: 'John',
        last_name: 'Doe',
        address: {
          street_address: '123 Main St',
          city: 'Anytown'
        },
        phone_numbers: [
          {
            type: 'home',
            number: '555-1234'
          },
          {
            type: 'work',
            number: '555-5678'
          }
        ]
      };

      const expectedOutput = {
        firstName: 'John',
        lastName: 'Doe',
        address: {
          streetAddress: '123 Main St',
          city: 'Anytown'
        },
        phoneNumbers: [
          {
            type: 'home',
            number: '555-1234'
          },
          {
            type: 'work',
            number: '555-5678'
          }
        ]
      };

      const output = camelCaseKeys(input);

      expect(output).toEqual(expectedOutput);
    });

    it('should return null for null input', () => {
      const input = null;
      const output = camelCaseKeys(input);
      expect(output).toBeNull();
    });

    it('should return undefined for undefined input', () => {
      const input = undefined;
      const output = camelCaseKeys(input);
      expect(output).toBeUndefined();
    });

    it('should not modify non-object input', () => {
      const input = 'hello';
      const output = camelCaseKeys(input);
      expect(output).toBe(input);
    });

    it('should not modify array input', () => {
      const input = ['hello', 'world'];
      const output = camelCaseKeys(input);
      expect(output).toEqual(input);
    });

    it('should modify object in array', () => {
      const input1 = [{ user: { first_name: 'test' } }];
      const output1 = camelCaseKeys(input1);
      expect(output1).toEqual([{ user: { firstName: 'test' } }]);
    });

    it('should correctly map Date objects', () => {
      const input = {
        created_at: new Date('2020-01-01T00:00:00.000Z'),
        updated_at: new Date('2020-01-01T00:00:00.000Z')
      };

      const output = camelCaseKeys(input);

      expect(output).toEqual({
        createdAt: new Date('2020-01-01T00:00:00.000Z'),
        updatedAt: new Date('2020-01-01T00:00:00.000Z')
      });
    });
  });
});
