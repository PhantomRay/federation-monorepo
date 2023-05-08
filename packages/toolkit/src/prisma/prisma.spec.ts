import { parseKeywords, parseWhereCondition } from './prisma';

describe('parseWhereCondition', () => {
  it('should throw an error if the argument is not an object', () => {
    expect(() => parseWhereCondition('not an object')).toThrow('Invalid where condition');

    // array
    expect(() => parseWhereCondition([])).toThrow('Invalid where condition');
  });

  it('should replace undefined values with empty strings', () => {
    expect(
      parseWhereCondition({
        name: 'John',
        age: undefined,
        email: 'john@example.com'
      })
    ).toEqual({
      name: 'John',
      age: '',
      email: 'john@example.com'
    });
  });

  it('should handle "not" condition', () => {
    expect(
      parseWhereCondition({
        name: { not: undefined },
        age: 30,
        email: { node: 'john@example.com' }
      })
    ).toEqual({
      name: { not: '' },
      age: 30,
      email: { node: 'john@example.com' }
    });
  });

  it('should handle children condition', () => {
    expect(
      parseWhereCondition({
        user: {
          id: undefined
        }
      })
    ).toEqual({
      user: {
        id: ''
      }
    });
  });

  it('should not modify the object if there are no undefined values', () => {
    expect(
      parseWhereCondition({
        name: 'John',
        age: 30,
        email: 'john@example.com'
      })
    ).toEqual({
      name: 'John',
      age: 30,
      email: 'john@example.com'
    });
  });

  it('should valid OR', () => {
    expect(
      parseWhereCondition({
        OR: [{ id: undefined }, { username: undefined, email: 'email' }]
      })
    ).toEqual({ OR: [{ id: '' }, { username: '', email: 'email' }] });
  });
});

describe('parseKeywords', () => {
  it('should return an empty string if no keywords are provided', () => {
    expect(parseKeywords('')).toEqual('');
  });

  it('should replace non-word characters with &', () => {
    expect(parseKeywords('hello world')).toEqual('hello&world');
    expect(parseKeywords('foo-bar')).toEqual('foo&bar');
    expect(parseKeywords('baz!qux')).toEqual('baz&qux');
  });

  it('should remove leading and trailing whitespace from each word', () => {
    expect(parseKeywords('  hello  world  ')).toEqual('hello&world');
    expect(parseKeywords('  foo-bar  ')).toEqual('foo&bar');
    expect(parseKeywords('  baz!qux  ')).toEqual('baz&qux');
  });

  it('should handle empty words', () => {
    expect(parseKeywords('hello  world')).toEqual('hello&world');
    expect(parseKeywords('foo  -  bar')).toEqual('foo&bar');
    expect(parseKeywords('baz  !  qux')).toEqual('baz&qux');
  });
});
